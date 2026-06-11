const { Queue } = require("bullmq");
const config = require("../config/config");

const connection = {
  host: config.redis.host,
  port: config.redis.port,
};

const bulkMoveQueue = new Queue("bulk-move", { connection });
const emailQueue = new Queue("email", { connection });

module.exports = { bulkMoveQueue, emailQueue, connection };
