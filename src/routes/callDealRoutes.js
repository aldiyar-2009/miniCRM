const express = require("express");
const callDealController = require("../controllers/callDealController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { cacheMiddleware } = require("../utils/cache");

const router = express.Router();

router.post("/call-deals/bulk-move", auth, callDealController.bulkMove);
router.get(
  "/call-deals/bulk-move/:jobId",
  auth,
  callDealController.getBulkMoveStatus,
);

router.get("/call-deals", auth, cacheMiddleware("call-deals"), callDealController.getAll);
router.get("/call-deals/:id", auth, callDealController.getById);

router.post("/call-deals", auth, callDealController.create);
router.put("/call-deals/:id", auth, callDealController.update);

router.patch("/call-deals/:id/move", auth, callDealController.move);

router.delete(
  "/call-deals/:id",
  auth,
  role(["admin"]),
  callDealController.delete,
);

module.exports = router;
