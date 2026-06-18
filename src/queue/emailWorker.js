const { Worker } = require("bullmq");

const { connection } = require("./queue");

const emailWorker = new Worker(
  "email",
  async (job) => {
    if (job.name === "welcome-email") {
      const { email, name } = job.data;
      console.log(`[Email] Приветствие → ${name} (${email})`);
    }

    if (job.name === "login-alert") {
      const { email, name } = job.data;
      console.log(`[Email] Оповещение о входе → ${name} (${email})`);
    }

    if (job.name === "callback-reminder") {
      const { email, name, clientName, phone } = job.data;
      console.log(
        `[Email] Напоминание → ${name} (${email}): позвонить ${clientName} на ${phone}`,
      );
    }
  },
  { connection },
);

emailWorker.on("completed", (job) => {
  console.log(`[Email Worker] Задача ${job.id} (${job.name}) выполнена`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`[Email Worker] Задача ${job.id} завершилась с ошибкой: ${err.message}`);
});

module.exports = emailWorker;
