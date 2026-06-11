require("dotenv").config();
const Redis = require("ioredis");
const redis = new Redis();
module.exports = {
  port: process.env.PORT || 3000,
  db: {
    client: "postgresql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "aldiyar",
    database: process.env.DB_NAME || "postgres",
  },
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
};
