/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("activities", function (table) {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table
      .uuid("deal_id")
      .notNullable()
      .references("id")
      .inTable("deals")
      .onDelete("CASCADE");
    table
      .uuid("contact_id")
      .references("id")
      .inTable("contacts")
      .onDelete("SET NULL");
    table
      .uuid("user_id")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .enum("type", ["call", "email", "meeting", "note", "task"])
      .notNullable();
    table.text("body");
    table.timestamp("scheduled_at");
    table.boolean("completed").defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("activities");
};
