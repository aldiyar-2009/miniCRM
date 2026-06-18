/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("chat_messages", function (table) {
    table
      .uuid("crm_deal_id")
      .nullable()
      .references("id")
      .inTable("deals")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("chat_messages", function (table) {
    table.dropColumn("crm_deal_id");
  });
};
