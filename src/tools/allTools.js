const weatherTool = require("./weatherTool");
const calculatorTool = require("./calculatorTool");
const crmSearchTool = require("./searchTool");

const toolRegistry = {
  get_weather: weatherTool.execute.bind(weatherTool),
  calculate: calculatorTool.execute.bind(calculatorTool),
  search_crm: crmSearchTool.execute.bind(crmSearchTool),
};

function getToolExecutor(toolName) {
  if (!toolRegistry[toolName]) {
    throw new Error(`Инструмент '${toolName}' не найден`);
  }
  return toolRegistry[toolName];
}

module.exports = {
  toolRegistry,
  getToolExecutor,
  getAvailableTools: () => Object.keys(toolRegistry),
};
