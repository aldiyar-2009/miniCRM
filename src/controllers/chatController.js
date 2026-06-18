const chatService = require("../services/chatService");
const AppError = require("../../AppError");

class chatController {
  async sendMessage(req, res, next) {
    try {
      const { message, session_id, crm_deal_id } = req.body;

      if (!message || !message.trim()) {
        throw new AppError("Сообщение не может быть пустым", 400);
      }

      const answer = await chatService.sendMessage({
        message: message.trim(),
        session_id: session_id || null,
        crm_deal_id: crm_deal_id || null,
        user_id: req.user.id,
      });

      res.json({ answer });
    } catch (error) {
      next(error);
    }
  }

  async createSession(req, res, next) {
    try {
      const { title } = req.body;
      const session = await chatService.createSession(req.user.id, title);
      res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req, res, next) {
    try {
      const sessions = await chatService.getSessions(req.user.id);
      res.json({ data: sessions });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { session_id } = req.query;
      if (!session_id) {
        throw new AppError("Нужен session_id", 400);
      }

      const history = await chatService.getHistory(session_id);
      res.json({ data: history });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new chatController();
