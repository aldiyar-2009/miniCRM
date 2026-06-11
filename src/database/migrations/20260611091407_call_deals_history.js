/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("call_deal_history", function (table) {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table
      .uuid("call_deal_id")
      .notNullable()
      .references("id")
      .inTable("call_deals")
      .onDelete("CASCADE");
    table
      .uuid("from_column")
      .nullable()
      .references("id")
      .inTable("deal_columns")
      .onDelete("SET NULL");
    table
      .uuid("to_column")
      .nullable()
      .references("id")
      .inTable("deal_columns")
      .onDelete("SET NULL");
    table
      .uuid("moved_by")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.timestamp("moved_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("call_deal_history");
};
