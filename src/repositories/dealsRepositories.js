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

  async getAllDealsPaginated({ limit = 10, cursor = null }) {
    let query = db("deals")
      .select(
        "deals.*",
        "companies.name as company_name",
        "users.name as owner_name",
      )
      .leftJoin("companies", "deals.company_id", "companies.id")
      .leftJoin("users", "deals.owner_id", "users.id");

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, "base64").toString("utf-8");
      const [lastCreatedAt, lastId] = decodedCursor.split("|");
      
      query = query.where(function() {
        this.where("deals.created_at", "<", lastCreatedAt)
            .orWhere(function() {
              this.where("deals.created_at", "=", lastCreatedAt)
                  .andWhere("deals.id", "<", lastId);
            });
      });
    }

    const results = await query
      .orderBy("deals.created_at", "desc")
      .orderBy("deals.id", "desc")
      .limit(Number(limit) + 1);

    const hasNextPage = results.length > limit;
    const data = hasNextPage ? results.slice(0, limit) : results;

    let nextCursor = null;
    if (hasNextPage && data.length > 0) {
      const lastItem = data[data.length - 1];
      const createdAtStr = lastItem.created_at instanceof Date ? lastItem.created_at.toISOString() : lastItem.created_at;
      const cursorStr = `${createdAtStr}|${lastItem.id}`;
      nextCursor = Buffer.from(cursorStr).toString("base64");
    }

    return {
      data,
      nextCursor,
    };
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
