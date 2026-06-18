/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex.schema.createTable("chat_messages", function (table) {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table
      .uuid("deal_id")
      .nullable()
      .references("id")
      .inTable("call_deals")
      .onDelete("CASCADE");
    table
      .uuid("contact_id")
      .nullable()
      .references("id")
      .inTable("contacts")
      .onDelete("SET NULL");
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.text("user_message").notNullable();
    table.text("ai_response").nullable();
    table.string("model", 100).defaultTo("llama-3.3-70b-versatile");
    table.integer("token_used").nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("chat_messages");
};
