const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

router.post("/users/register", userController.createUser);
router.post("/users/login", userController.loginUser);
router.get("/users", userController.getAllUser);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
