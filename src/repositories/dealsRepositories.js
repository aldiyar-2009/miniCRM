const db = require("../database/db");

class DealRepository {
  async createDeal(data) {
    const [deal] = await db("deals").insert(data).returning("*");
    return deal;
  }

  async getAllDeals() {
    return db("deals")
      .select(
        "deals.*",
        "companies.name as company_name",
        "users.name as owner_name",
      )
      .leftJoin("companies", "deals.company_id", "companies.id")
      .leftJoin("users", "deals.owner_id", "users.id")
      .orderBy("deals.created_at", "desc");
  }

  async getDealById(id) {
    return db("deals")
      .select(
        "deals.*",
        "companies.name as company_name",
        "users.name as owner_name",
      )
      .join("companies", "deals.company_id", "companies.id")
      .join("users", "deals.owner_id", "users.id")
      .where("deals.id", id)
      .first();
  }

  async updateDeal(id, data) {
    const [deal] = await db("deals")
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning("*");
    return deal;
  }

  async deleteDeal(id) {
    return db("deals").where({ id }).delete();
  }
}

module.exports = new DealRepository();
