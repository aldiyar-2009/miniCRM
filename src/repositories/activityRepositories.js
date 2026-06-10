const db = require("../database/db");

class activityRepasitories {
  async createActivity(
    deal_id,
    contact_id,
    user_id,
    type,
    body,
    scheduled_at,
    completed,
  ) {
    const [activity] = await db("activities")
      .insert({
        deal_id,
        contact_id,
        user_id,
        type,
        body,
        scheduled_at,
        completed,
      })
      .returning("*");
    return activity;
  }

  async getActivitiesByDealId(dealId) {
    return db("activities")
      .select(
        "activities.*",
        "users.name as user_name",
        "contacts.first_name as contact_first_name",
        "contacts.last_name as contact_last_name",
      )
      .leftJoin("users", "activities.user_id", "users.id")
      .leftJoin("contacts", "activities.contact_id", "contacts.id")
      .where("activities.deal_id", dealId)
      .orderBy("activities.created_at", "desc");
  }
}

module.exports = new activityRepasitories();
