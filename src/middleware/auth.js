const jwt = require("jsonwebtoken");
const config = require("../config/token");

function auth(req, res, next) {
  const authHeader =
    req.header("Authorization") ||
    req.header("authorization") ||
    req.headers["x-access-token"] ||
    req.headers["x-auth-token"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Доступ запрещен, токен отсутствует" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, config.accessSecret);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Неверный или просроченный токен" });
  }
}

module.exports = auth;
