const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

// Публичные маршруты
router.post("/users/register", userController.createUser);
router.post("/users/login", userController.loginUser);
router.post("/users/refresh", userController.refreshToken);

// Защищённые маршруты
router.get("/users", auth, role(["admin"]), userController.getAllUser);
router.get("/users/:id", auth, role(["admin"], { allowSelf: true }), userController.getUserById);
router.put("/users/:id", auth, role(["admin"], { allowSelf: true }), userController.updateUser);
router.delete("/users/:id", auth, role(["admin"]), userController.deleteUser);

module.exports = router;
