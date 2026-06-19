const fs = require("fs");
const ragService = require("../services/ragService");
const AppError = require("../../AppError");

class knowledgeController {
  async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError("Файл не загружен", 400);
      }

      const text = fs.readFileSync(req.file.path, "utf-8");

      if (!text || !text.trim()) {
        throw new AppError("Файл пустой или не текстовый", 400);
      }

      const doc = ragService.addDocument(
        req.user.id,
        req.file.originalname,
        text,
      );

      res.status(201).json({
        message: "Документ загружен и разбит на чанки",
        document: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDocuments(req, res, next) {
    try {
      const documents = ragService.listDocuments(req.user.id);
      res.json({ data: documents });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new knowledgeController();
