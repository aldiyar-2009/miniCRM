const { Groq } = require("groq-sdk/client.js");
const AppError = require("../../AppError");
const aiConfig = require("../config/aiConfig");
const { trimMessages } = require("../utils/trimContext");
const chatRepository = require("../repositories/chatRepositories");
const dealRepository = require("../repositories/dealsRepositories");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const toolsConfig = require("../config/toolsConfig");
const toolExecutor = require("./toolExecutor");

class chatService {
  async buildSystemPrompt(crm_deal_id) {
    let text =
      "Ты AI-ассистент CRM miniCRM. Отвечай кратко и по делу на русском языке.";

    if (crm_deal_id) {
      const deal = await dealRepository.getDealById(crm_deal_id);
      if (!deal) {
        throw new AppError(`Сделка ${crm_deal_id} не найдена`, 404);
      }
      text += `\n\nДанные сделки:
- Название: ${deal.title}
- Компания: ${deal.company_name || "—"}
- Сумма: ${deal.amount || "—"} ${deal.currency || ""}
- Стадия: ${deal.stage}
- Ответственный: ${deal.owner_name || "—"}`;
    }

    return text;
  }

  async buildMessages(userMessage, systemPrompt, session_id) {
    const messages = [{ role: "system", content: systemPrompt }];

    if (session_id) {
      const history = await chatRepository.getHistoryBySession(session_id, 30);
      for (const row of history) {
        messages.push({ role: "user", content: row.user_message });
        if (row.ai_response) {
          messages.push({ role: "assistant", content: row.ai_response });
        }
      }
    }

    messages.push({ role: "user", content: userMessage });

    return trimMessages(messages, aiConfig.maxContextTokens);
  }

  async sendMessage({ message, session_id, crm_deal_id, user_id }) {
    const systemPrompt = await this.buildSystemPrompt(crm_deal_id);

    const enhancedSystemPrompt =
      systemPrompt +
      "\n\nДоступные инструменты: get_weather, calculate, search_crm. " +
      "Используй их когда они необходимы для ответа.";

    let messages = await this.buildMessages(
      message,
      enhancedSystemPrompt,
      session_id,
    );

    const saved = await chatRepository.saveMessage({
      session_id,
      crm_deal_id: crm_deal_id || null,
      user_id,
      user_message: message,
      model: aiConfig.model,
    });

    let finalAnswer = "";
    let iterationCount = 0;
    const maxIterations = 5;
    const previousToolCalls = new Set();

    while (iterationCount < maxIterations) {
      iterationCount++;

      const response = await groq.chat.completions.create({
        model: aiConfig.model,
        messages,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.max_tokens,
        top_p: aiConfig.top_p,
        tools: toolsConfig.tools,
        tool_choice: "auto",
      });

      const assistantMessage = response.choices[0].message;

      messages.push({
        role: "assistant",
        content: assistantMessage.content || "",
        tool_calls: assistantMessage.tool_calls || [],
      });

      if (
        !assistantMessage.tool_calls ||
        assistantMessage.tool_calls.length === 0
      ) {
        finalAnswer =
          assistantMessage.content || "Я не могу ответить на этот вопрос.";
        break;
      }

      console.log(
        `Итерация ${iterationCount}: ИИ вызывает ${assistantMessage.tool_calls.length} инструмент(ов)`,
      );

      const rawCalls = Array.isArray(assistantMessage.tool_calls)
        ? assistantMessage.tool_calls
        : [];

      const toolCalls = rawCalls.map((call, idx) => {
        const tool_call_id = call.tool_call_id || `gen-${Date.now()}-${idx}`;
        if (!call.tool_call_id) {
          console.warn("generate tool_call_id for call", {
            idx,
            tool: call.function?.name,
            tool_call_id,
          });
        }
        let args = {};
        try {
          args = call.function?.arguments
            ? JSON.parse(call.function.arguments)
            : {};
        } catch (err) {
          console.warn("Invalid JSON in tool arguments", err);
        }
        return {
          tool_call_id,
          name: call.function?.name,
          args,
        };
      });

      const repeatedCalls = toolCalls.filter((call) => {
        const key = `${call.name}:${JSON.stringify(call.args)}`;
        const exists = previousToolCalls.has(key);
        previousToolCalls.add(key);
        return exists;
      });

      if (repeatedCalls.length > 0) {
        const repeatNames = repeatedCalls
          .map((call) => `${call.name} ${JSON.stringify(call.args)}`)
          .join(", ");
        const repeatText = `Инструмент(ы) вызваны повторно: ${repeatNames}. Я завершаю цикл.`;
        console.warn(repeatText);
        finalAnswer =
          assistantMessage.content ||
          `Инструмент(ы) были выполнены, но модель зациклилась.`;
        break;
      }

      const toolResults = await toolExecutor.executeToolsParallel(
        toolCalls.map((call) => ({ name: call.name, args: call.args })),
      );

      for (let i = 0; i < toolResults.length; i++) {
        const toolResult = toolResults[i];
        const toolCall = toolCalls[i];

        messages.push({
          role: "tool",
          name: toolResult.tool,
          tool_call_id: toolCall.tool_call_id,
          content: JSON.stringify(toolResult.result),
        });
      }

      const failures = toolResults.filter(
        (t) => !t.result || t.result.success === false,
      );
      if (failures.length > 0) {
        const msgs = failures.map(
          (f) => `${f.tool}: ${f.result?.error || JSON.stringify(f.result)}`,
        );
        const failText = `Не удалось выполнить инструмент(ы): ${msgs.join("; ")}`;
        messages.push({ role: "assistant", content: failText });
        finalAnswer = failText;
        break;
      }
      console.log("Результаты инструментов:", toolResults);
    }

    const tokensUsed = 0;

    await chatRepository.updateAiResponse(saved.id, finalAnswer, tokensUsed);

    return finalAnswer;
  }

  async createSession(user_id, title) {
    return chatRepository.saveSession(user_id, title);
  }

  async getSessions(user_id) {
    return chatRepository.getSessionsByUser(user_id);
  }

  async getHistory(session_id) {
    return chatRepository.getHistoryBySession(session_id);
  }
}

module.exports = new chatService();
