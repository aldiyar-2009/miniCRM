const redis = require("../config/redis");

/**
 * @param {string} resourceName
 * @param {number} ttl
 */
function cacheMiddleware(resourceName, ttl = 1800) {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${resourceName}:${req.originalUrl || req.url}`;

    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("Content-Type", "application/json");
        return res.send(cachedData);
      }

      res.setHeader("X-Cache", "MISS");

      const originalJson = res.json;
      res.json = function (body) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.set(key, JSON.stringify(body), "EX", ttl).catch((err) => {
            console.error(`[Кэш] Ошибка при сохранении ключа ${key} в Redis:`, err);
          });
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (err) {
      console.error(`[Кэш] Ошибка Redis в middleware для ключа ${key}:`, err);
      next();
    }
  };
}

/**
 * @param {string} resourceName
 */
async function clearCache(resourceName) {
  try {
    const pattern = `cache:${resourceName}:*`;
    const keys = await redis.keys(pattern);
    if (keys && keys.length > 0) {
      await redis.del(keys);
      console.log(`[Кэш] Очищено ключей: ${keys.length} по шаблону: ${pattern}`);
    }
  } catch (err) {
    console.error(`[Кэш] Ошибка при очистке кэша для ${resourceName}:`, err);
  }
}

module.exports = {
  cacheMiddleware,
  clearCache,
};
