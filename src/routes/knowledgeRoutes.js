const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const knowledgeController = require("../controllers/knowledgeController");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "knowledge_uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "--" + file.originalname),
});

const upload = multer({ storage });

router.post(
  "/knowledge/upload",
  auth,
  upload.single("document"),
  knowledgeController.uploadDocument,
);
router.get("/knowledge/documents", auth, knowledgeController.getDocuments);

module.exports = router;
