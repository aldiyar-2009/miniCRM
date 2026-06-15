const AppError = require("../AppError");
const redis = require("../config/redis");
const dealColumnsRepository = require("../repositories/dealColumnsRepository");

const CACHE_KEY = "deal_columns:all";
const TTL = 3600;

class dealColumnsService {
  async getAll() {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    const columns = await dealColumnsRepository.getAll();

    await redis.setex(CACHE_KEY, TTL, JSON.stringify(columns));

    return columns;
  }

  async create(data) {
    const maxPosition = await dealColumnsRepository.getMaxPosition();

    const column = await dealColumnsRepository.create({
      ...data,
      position: maxPosition + 1,
    });

    await redis.del(CACHE_KEY);
    return column;
  }

  async update(id, data) {
    const column = await dealColumnsRepository.update(id, data);

    await redis.del(CACHE_KEY);

    return column;
  }

  async delete(id) {
    const column = await dealColumnsRepository.delete(id);
    await redis.del(CACHE_KEY);
  }
  async reorder(columns) {
    if (!columns || columns.length === 0) {
      throw new AppError("Список столбцов пуст", 400);
    }
    return dealColumnsRepository.updatePositions(columns);
  }
}

module.exports = new dealColumnsService();
