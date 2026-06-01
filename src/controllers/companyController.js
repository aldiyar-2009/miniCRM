const companyService = require("../services/companyService");

class companyController {
  async createCompany(req, res) {
    try {
      const id = await companyService.createCompany(req.body);
      res.status(200).json(id);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new companyController();
