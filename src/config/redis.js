const Redis = require("ioredis");

const config = require("./config");

const redisOptions = {
  host: config.redis.host,
  port: config.redis.port,
};

if (config.redis.password) {
  redisOptions.password = config.redis.password;
}

const redis = new Redis(redisOptions);

redis.on("error", (err) => console.error("Redis error:", err));

module.exports = redis;
