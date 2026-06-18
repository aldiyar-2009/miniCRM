class calculatorTool {
  ALLOWED_CHARS = /^[0-9+\-*/().%\s]+$/;

  async execute(params) {
    const { expression } = params;

    if (!expression || expression.trim().length === 0) {
      return {
        success: false,
        error: "Пустое выражение",
      };
    }

    try {
      const result = Function('"use strict"; return (' + expression + ")")();
      if (typeof result !== "number" || isNaN(result)) {
        return {
          success: false,
          error: "Пишите только числа",
        };
      }

      return {
        success: true,
        data: {
          expression: expression,
          result: result,
          formattedResult: this.formatResult(result),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Ошибка вычисления: ${error.message}`,
      };
    }
  }

  formatResult(num) {
    if (Number.isInteger(num)) {
      return num.toString();
    }
    return num.toFixed(2);
  }
}

module.exports = new calculatorTool();
