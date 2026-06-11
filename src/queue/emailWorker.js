const { Worker } = require("bullmq");

const { connection } = require("./queue");

const emailWorker = new Worker(
  "email",
  async (job) => {
    if (job.name === "welcome-email") {
      const { email, name } = job.data;
      console.log(`[Email] Welcome → ${name} (${email})`);
    }

    if (job.name === "login-alert") {
      const { email, name } = job.data;
      console.log(`[Email] Login alert → ${name} (${email})`);
    }

    if (job.name === "callback-reminder") {
      const { email, name, clientName, phone } = job.data;
      console.log(
        `[Email] Reminder → ${name} (${email}): позвонить ${clientName} на ${phone}`,
      );
    }
  },
  { connection },
);

emailWorker.on("completed", (job) => {
  console.log(`[Email Worker] Job ${job.id} (${job.name}) выполнен`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`[Email Worker] Job ${job.id} провалился: ${err.message}`);
});

module.exports = emailWorker;
