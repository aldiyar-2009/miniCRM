const companyService = require("../services/companyService");
const { clearCache } = require("../utils/cache");

const {
  validateCompany,
  validateCompanyUpdate,
} = require("../middleware/validate");

class companyController {
  async createCompany(req, res, next) {
    try {
      const { name, industry, website } = req.body;
      const { error, value } = validateCompany(req.body);
      if (error) {
        return res.status(400).json({ errors: error.details });
      }

      const company = await companyService.createCompany(value);
      clearCache("companies");
      clearCache("stats");
      res.status(201).json(company);
    } catch (err) {
      next(err);
    }
  }

  async getAllCompanies(req, res, next) {
    try {
      const companies = await companyService.getAllCompanies();
      res.status(200).json(companies);
    } catch (err) {
      next(err);
    }
  }

  async getCompanyById(req, res, next) {
    try {
      const company = await companyService.getCompanyById(req.params.id);
      res.status(200).json(company);
    } catch (err) {
      next(err);
    }
  }

  async updateCompany(req, res, next) {
    try {
      const { name, industry, website } = req.body;
      const { error, value } = validateCompanyUpdate(req.body);
      if (error) {
        return res.status(400).json({ errors: error.details });
      }

      const company = await companyService.updateCompany(req.params.id, value);
      clearCache("companies");
      clearCache("stats");
      res.status(200).json(company);
    } catch (err) {
      next(err);
    }
  }

  async deleteCompany(req, res, next) {
    try {
      await companyService.deleteCompany(req.params.id);
      clearCache("companies");
      clearCache("stats");
      res.status(200).json({ message: "Компания удалена" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new companyController();
