const db = require("../database/db");

class callDealRepository {
  async getAll() {
    return db("call_deals").select("*");
  }
  async getByColumnId(columnId) {
    return db("call_deals")
      .where({ column_id: columnId })
      .orderBy("position", "asc");
  }

  async getByAssignedUser(userId) {
    return db("call_deals")
      .where({ assigned_to: userId })
      .orderBy("position", "asc");
  }

  async getById(id) {
    return db("call_deals")
      .select(
        "call_deals.*",
        "deal_columns.name AS column_name",
        "users.name AS assigned_name",
      )
      .leftJoin("deal_columns", "call_deals.column_id", "deal_columns.id")
      .leftJoin("users", "call_deals.assigned_to", "users.id")
      .where("call_deals.id", id)
      .first();
  }

  async create(data) {
    const [deal] = await db("call_deals").insert(data).returning("*");
    return deal;
  }

  async update(id, data) {
    const [deal] = await db("call_deals")
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning("*");
    return deal;
  }

  async delete(id) {
    return db("call_deals").where({ id }).delete();
  }

  async moveToColumn(id, columnId, position) {
    const [deal] = await db("call_deals")
      .where({ id })
      .update({ column_id: columnId, position, updated_at: db.fn.now() })
      .returning("*");
    return deal;
  }

  async getDueCallbacks() {
    return db("call_deals")
      .whereNotNull("callback_at")
      .where("callback_at", "<=", db.raw("NOW()"))
      .select("*");
  }

  async getManyByIds(ids) {
    return db("call_deals").whereIn("id", ids);
  }

  async bulkMoveToColumn(ids, columnId) {
    return db("call_deals")
      .whereIn("id", ids)
      .update({ column_id: columnId, updated_at: db.fn.now() });
  }
}

module.exports = new callDealRepository();
