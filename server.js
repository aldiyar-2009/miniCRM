require("dotenv").config();

const { app, server } = require("./src/app");

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Сервер запущен и работает: http://localhost:${PORT}`);
  console.log(`📬 Email воркер запущен и слушает очередь`);
});
