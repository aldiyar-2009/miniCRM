const dealService = require("../services/dealsService");
const { validateDeal, validateDealUpdate } = require("../middleware/validate");

class DealController {
  async createDeal(req, res, next) {
    try {
      const {
        company_id,
        owner_id,
        title,
        amount,
        currency,
        stage,
        close_date,
      } = req.body;
      const { error, value } = validateDeal(req.body);
      if (error) {
        return res.status(400).json({ errors: error.details });
      }

      const deal = await dealService.createDeal(value);
      res.status(201).json(deal);
    } catch (err) {
      next(err);
    }
  }

  async getAllDeals(req, res, next) {
    try {
      const deals = await dealService.getAllDeals();
      res.status(200).json(deals);
    } catch (err) {
      next(err);
    }
  }

  async getDealById(req, res, next) {
    try {
      const deal = await dealService.getDealById(req.params.id);
      res.status(200).json(deal);
    } catch (err) {
      next(err);
    }
  }

  async updateDeal(req, res, next) {
    try {
      const {
        company_id,
        owner_id,
        title,
        amount,
        currency,
        stage,
        close_date,
      } = req.body;
      const { error, value } = validateDealUpdate(req.body);
      if (error) {
        return res.status(400).json({ errors: error.details });
      }

      const deal = await dealService.updateDeal(req.params.id, value);
      res.status(200).json(deal);
    } catch (err) {
      next(err);
    }
  }

  async deleteDeal(req, res, next) {
    try {
      await dealService.deleteDeal(req.params.id);
      res.status(200).json({ message: `Сделка c ID ${req.params.id} удалена` });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DealController();
