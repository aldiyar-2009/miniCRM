require("dotenv").config();

const { server } = require("./src/app");
require("./src/queue/bulkMoveWorker");
require("./src/queue/emailWorker");

require("./src/queue/scheduler");

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Сервер запущен и работает: http://localhost:${PORT}`);
  console.log(`📬 Email воркер запущен и слушает очередь`);
});
