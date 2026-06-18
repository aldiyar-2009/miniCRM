const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const { cacheMiddleware } = require("../utils/cache");

router.get("/stats", cacheMiddleware("stats"), statsController.getStats);

module.exports = router;
