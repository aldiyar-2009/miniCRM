const callDealService = require("../services/callDealService");

class callDealController {
  async getAll(req, res, next) {
    try {
      const { columnId } = req.query;

      const deals = columnId
        ? await callDealService.getByColumn(columnId)
        : await callDealService.getAll();
      res.status(200).json(deals);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const deal = await callDealService.create({
        ...req.body,
        created_by: req.user.id,
      });
      res.status(201).json(deal);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const deal = await callDealService.create({
        ...req.body,
        created_by: req.user.id,
      });
      res.status(200).json(deal);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const deal = await callDealService.update(req.params.id, req.body);
      res.status(200).json(deal);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const deal = await callDealService.delete(req.params.id);
      res.status(200).json({ message: "Сделка удалена" });
    } catch (error) {
      next(error);
    }
  }

  async move(req, res, next) {
    try {
      const deal = await callDealService.move(
        req.params.id,
        req.body.targetColumnId,
        req.user.id,
      );
      res.status(200).json(deal);
    } catch (error) {
      next(error);
    }
  }

  async bulkMove(req, res, next) {
    try {
      const result = await callDealService.bulkMove(
        req.body.dealIds,
        req.body.targetColumnId,
        req.user.id,
      );

      res.status(202).json(result);
    } catch (error) {
      next(error);
    }
  }
  async getBulkMoveStatus(req, res, next) {
    try {
      const status = await callDealService.getBulkMoveStatus(req.params.jobId);
      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new callDealController();
