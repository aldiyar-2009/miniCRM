const AppError = require("../../AppError");
const notificationRepository = require("../repositories/notificationRepository");

class NotificationService {
  async getUnread(userId) {
    return notificationRepository.getUnreadByUser(userId);
  }

  async create(data) {
    return notificationRepository.create(data);
  }

  async markAsRead(id, userId) {
    const notifications = await notificationRepository.getUnreadByUser(userId);
    const owns = notifications.find((n) => n.id === id);

    if (!owns) throw new AppError("Уведомление не найдено", 404);

    return notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }
}

module.exports = new NotificationService();
