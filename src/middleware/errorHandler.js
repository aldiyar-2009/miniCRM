const AppError = require("../../AppError");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.isJoi) {
    return res.status(400).json({ error: err.details[0].message });
  }
  return res.status(500).json({ error: "Внутренняя ошибка сервера" });
};

module.exports = errorHandler;
