const db = require("../database/db");

class callDealHistoryRepositories {
  async create(data) {
    const [record] = await db("call_deal_history").insert(data).returning("*");
    return record;
  }

  async bulkCreate(records) {
    return db("call_deal_history").insert(records);
  }

  async getByDealId(callDealId) {
    return db("call_deal_history")
      .select(
        "call_deal_history.*",
        "from_col.name AS from_column_name",
        "to_col.name AS to_column_name",
        "users.name AS moved_by_name",
      )
      .leftJoin(
        "deal_columns as from_col",
        "call_deal_history.from_column",
        "from_col.id",
      )
      .leftJoin(
        "deal_columns as to_col",
        "call_deal_history.to_column",
        "to_col.id",
      )
      .leftJoin("users", "call_deal_history.moved_by", "users.id")
      .where("call_deal_history.call_deal_id", callDealId)
      .orderBy("call_deal_history.moved_at", "desc");
  }
}

module.exports = new callDealHistoryRepositories();
