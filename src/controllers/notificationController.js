const notificationService = require("../services/notificationService");

class notificationController {
  async getUnread(req, res, next) {
    try {
      const notifications = await notificationService.getUnread(req.user.id);
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.user.id,
      );
      res.status(200).json(notification);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      res.status(200).json({ message: "Все уведомления прочитаны" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new notificationController();
