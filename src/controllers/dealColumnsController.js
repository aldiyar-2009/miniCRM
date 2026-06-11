const dealColumnsService = require("../services/dealColumnsService");

class dealColumnsController {
  async getAll(req, res, next) {
    try {
      const columns = await dealColumnsService.getAll();
      res.status(200).json(columns);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const columns = await dealColumnsService.create({
        ...req.body,
        created_by: req.user.id,
      });
      res.status(201).json(columns);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const columns = await dealColumnsService.update(req.params.id, req.body);
      res.status(200).json(columns);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await dealColumnsService.delete(req.params.id);
      res.status(200).json({ message: "Столбец удален" });
    } catch (error) {
      next(error);
    }
  }

  async reorder(req, res, next) {
    try {
      await dealColumnsService.reorder(req.body.columns);
      res.status(200).json({ message: "Порядок обновлен" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new dealColumnsController();
