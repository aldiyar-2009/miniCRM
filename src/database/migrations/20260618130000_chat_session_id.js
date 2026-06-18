/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("chat_messages", function (table) {
    table.uuid("session_id").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("chat_messages", function (table) {
    table.dropColumn("session_id");
  });
};
