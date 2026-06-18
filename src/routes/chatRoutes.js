const express = require("express");
const auth = require("../middleware/auth");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.post("/chat", auth, chatController.sendMessage);
router.post("/chat/sessions", auth, chatController.createSession);
router.get("/chat/sessions", auth, chatController.getSessions);
router.get("/chat/history", auth, chatController.getHistory);

module.exports = router;
