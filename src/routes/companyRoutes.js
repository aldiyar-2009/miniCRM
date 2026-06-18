const express = require("express");
const companyController = require("../controllers/companyController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { cacheMiddleware } = require("../utils/cache");

const { app } = require("../app");
const router = express.Router();

router.post("/companies", companyController.createCompany);
router.get("/companies", cacheMiddleware("companies"), companyController.getAllCompanies);
router.get("/companies/:id", companyController.getCompanyById);
router.put("/companies/:id", companyController.updateCompany);
router.delete("/companies/:id", companyController.deleteCompany);

module.exports = router;
