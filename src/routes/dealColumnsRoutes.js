const express = require("express");
const dealColumnsController = require("../controllers/dealColumnsController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

router.get("/deal-columns", auth, dealColumnsController.getAll);

router.post(
  "/deal-columns",
  auth,
  role(["admin"]),
  dealColumnsController.create,
);
router.put(
  "/deal-columns/:id",
  auth,
  role(["admin"]),
  dealColumnsController.update,
);
router.delete(
  "/deal-columns/:id",
  auth,
  role(["admin"]),
  dealColumnsController.delete,
);

router.patch(
  "/deal-columns/reorder",
  auth,
  role(["admin"]),
  dealColumnsController.reorder,
);

module.exports = router;
