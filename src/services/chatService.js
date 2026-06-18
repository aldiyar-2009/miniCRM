const { Groq } = require("groq-sdk/client.js");
const AppError = require("../../AppError");
const aiConfig = require("../config/aiConfig");
const { trimMessages } = require("../utils/trimContext");
const chatRepository = require("../repositories/chatRepositories");
const dealRepository = require("../repositories/dealsRepositories");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    // Обрезаем старые сообщения, если контекст слишком длинный
    return trimMessages(messages, aiConfig.maxContextTokens);
  }

  async sendMessage({ message, session_id, crm_deal_id, user_id }) {
    const systemPrompt = await this.buildSystemPrompt(crm_deal_id);
    const messages = await this.buildMessages(
      message,
      systemPrompt,
      session_id,
    );

    const saved = await chatRepository.saveMessage({
      session_id,
      crm_deal_id: crm_deal_id || null,
      user_id,
      user_message: message,
      model: aiConfig.model,
    });

    const response = await groq.chat.completions.create({
      model: aiConfig.model,
      messages,
      temperature: aiConfig.temperature,
      max_tokens: aiConfig.max_tokens,
      top_p: aiConfig.top_p,
    });

    const answer = response.choices[0].message.content || "";
    const tokensUsed = response.usage?.total_tokens || 0;

    await chatRepository.updateAiResponse(saved.id, answer, tokensUsed);

    return answer;
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
