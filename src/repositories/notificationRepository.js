const db = require("../database/db");

class NotificationRepository {
  async getUnreadByUser(userId) {
    return db("notifications")
      .where({ user_id: userId, is_read: false })
      .orderBy("created_at", "desc");
  }

  async create(data) {
    const [notification] = await db("notifications")
      .insert(data)
      .returning("*");
    return notification;
  }

  async markAsRead(id) {
    const [notification] = await db("notifications")
      .where({ id })
      .update({ is_read: true })
      .returning("*");
    return notification;
  }

  async markAllAsRead(userId) {
    return db("notifications")
      .where({ user_id: userId, is_read: false })
      .update({ is_read: true });
  }

  async deleteOldRead(daysOld = 2) {
    return db("notifications")
      .where("is_read", true)
      .where("created_at", "<", db.raw(`NOW() - INTERVAL '${daysOld} days'`));
  }
}

module.exports = new NotificationRepository();
