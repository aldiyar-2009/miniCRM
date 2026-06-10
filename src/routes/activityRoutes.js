const express = require("express");
const activityController = require("../controllers/activityController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

router.post(
  "/activities",
  auth,
  role(["admin", "manager"]),
  activityController.createActivity,
);

router.get(
  "/deals/:dealId/activities",
  auth,
  role(["admin", "manager", "viewer"]),
  activityController.getActivitiesByDeal,
);

module.exports = router;
