const express = require("express");
const dealController = require("../controllers/dealsController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

router.post(
  "/deals",
  auth,
  role(["admin", "manager"]),
  dealController.createDeal,
);
router.get(
  "/deals",
  auth,
  role(["admin", "manager", "viewer"]),
  dealController.getAllDeals,
);
router.get(
  "/deals/:id",
  auth,
  role(["admin", "manager", "viewer"]),
  dealController.getDealById,
);
router.put(
  "/deals/:id",
  auth,
  role(["admin", "manager"]),
  dealController.updateDeal,
);
router.delete("/deals/:id", auth, role(["admin"]), dealController.deleteDeal);

module.exports = router;
