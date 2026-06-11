const db = require("../database/db");

class dealColumnRepasitory {
  async getAll() {
    return db("deal_columns").orderBy("position", "asc");
  }

  async getById(id) {
    return db("deal_columns").where({ id }).first();
  }

  async create(data) {
    const [column] = await db("deal_columns").insert(data).returning("*");
    return column;
  }

  async update(id, data) {
    const [column] = await db("deal_columns")
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning("*");
    return column;
  }

  async delete(id) {
    const [column] = await db("deal_columns").where({ id }).delete();
    return column;
  }

  async getMaxPosition() {
    const result = await db("deal_columns").max("position as max").first();
    return result.max || 0;
  }

  async updatePositions(columns) {
    const promises = columns.map(({ id, position }) =>
      db("deal_columns").where({ id }).update({ position }),
    );

    return Promise.all(promises);
  }
}

module.exports = new dealColumnRepasitory();
