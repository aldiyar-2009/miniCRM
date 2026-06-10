const db = require("../database/db");

class deal_stage_history {
  async createDealAndStage(data) {
    const [deal] = await db("deal_stage_history").insert(data).returning("*");
    return deal;
  }

  async getAllDealsAndStage() {
    return db("deal_stage_history")
      .select(
        "users.name as user_name",
        "deals.title as deal_title",
        "deals.amount as deal_amount",
        "deals.currency as currency",
        "deal_stage_history.stage_from as deal_stage_from",
        "deal_stage_history.stage_to as deal_stage_to",
      )
      .leftJoin("deals", "deal_stage_history.deal_id", "deals.id")
      .leftJoin("users", "deal_stage_history.changed_by", "users.id")
      .orderBy("deal_stage_history.created_at", "desc");
  }

  async getDealById(id) {
    return db("deal_stage_history")
      .select(
        "users.name as user_name",
        "deals.title as deal_title",
        "deals.amount as deal_amount",
        "deals.currency as currency",
        "deal_stage_history.stage_from as deal_stage_from",
        "deal_stage_history.stage_to as deal_stage_to",
      )
      .leftJoin("deals", "deal_stage_history.deal_id", "deals.id")
      .leftJoin("users", "deal_stage_history.changed_by", "users.id")
      .where("deal_stage_history.id", id)
      .first();
  }

  async updateDeal(id, data) {
    const [deal_stage_history] = await db("deal_stage_history")
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning("*");
    return deal_stage_history;
  }

  async deleteDeal(id) {
    return db("deal_stage_history").where({ id }).delete();
  }
}

module.exports = new DealRepository();
