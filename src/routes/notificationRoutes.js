const express = require("express");
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/notifications", auth, notificationController.getUnread);
router.patch(
  "/notifications/read-all",
  auth,
  notificationController.markAllAsRead,
);

router.patch(
  "/notifications/:id/read",
  auth,
  notificationController.markAsRead,
);

module.exports = router;
