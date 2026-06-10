const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");

// GET /stats — общая статистика по всем сущностям CRM
router.get("/stats", statsController.getStats);

module.exports = router;
