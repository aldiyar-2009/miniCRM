module.exports = {
  tools: [
    {
      type: "function",
      function: {
        name: "get_weather",
        description: "Получить погоду в городе",
        parameters: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "Название города",
            },
            units: {
              type: "string",
              enum: ["celsius", "fahrenheit"],
              description: "Единицы температуры",
            },
          },
          required: ["city"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate",
        description: "Выполнить математический расчёт",
        parameters: {
          type: "object",
          properties: {
            expression: {
              type: "string",
              description: "Математическое выражение",
            },
          },
          required: ["expression"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "search_crm",
        description: "Поиск сделок и контактов в CRM",
        parameters: {
          type: "object",
          properties: {
            searchType: {
              type: "string",
              enum: ["deals", "contacts", "companies"],
              description: "Что искать: сделки, контакты или компании",
            },
            query: {
              type: "string",
              description:
                "Поисковый запрос (название, статус, контакт и т.д.)",
            },
            status: {
              type: "string",
              description: "Фильтр по статусу (optional)",
            },
            limit: {
              type: "number",
              description: "Максимум результатов (default: 10)",
            },
          },
          required: ["searchType", "query"],
        },
      },
    },
  ],
};
