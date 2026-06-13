const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("../config/token");

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*", credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Нет токена"));
    }

    try {
      socket.user = jwt.verify(token, config.accessSecret);
      next();
    } catch {
      next(new Error("Неправильный токен"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Подключился: ${socket.user.name}`);

    socket.join(`user:${socket.user.id}`);

    socket.on("disconnect", () => {
      console.log(`[Socket] Отключился: ${socket.user.name}`);
    });
  });

  return io;
}

module.exports = { initSocket };
