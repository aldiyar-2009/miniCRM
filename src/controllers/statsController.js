const statsService = require("../services/statsService");

class StatsController {
  async getStats(req, res, next) {
    try {
      const stats = await statsService.getStats();
      return res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StatsController();
