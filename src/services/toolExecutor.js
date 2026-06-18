const { getToolExecutor } = require("../tools/allTools");
const AppError = require("../../AppError");

class ToolExecutor {
  async executeTool(toolName, toolParams) {
    try {
      const executor = getToolExecutor(toolName);
      const result = await executor(toolParams);
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Ошибка инструмента '${toolName}': ${error.message}`,
      };
    }
  }

  async executeToolsParallel(toolCalls) {
    const promises = toolCalls.map((call) =>
      this.executeTool(call.name, call.args)
        .then((result) => ({
          tool: call.name,
          result: result,
        }))
        .catch((error) => ({
          tool: call.name,
          result: {
            success: false,
            error: error.message,
          },
        })),
    );
    return await Promise.all(promises);
  }
}
module.exports = new ToolExecutor();
