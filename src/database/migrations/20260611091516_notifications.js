/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("notifications", function (table) {
    table.uuid("id").primary().defaultTo(knex.fn.uuid()); // было без ()
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .uuid("call_deal_id")
      .nullable()
      .references("id")
      .inTable("call_deals")
      .onDelete("CASCADE");
    table.text("message").notNullable();
    table.boolean("is_read").notNullable().defaultTo(false);
    table.timestamp("fire_at").nullable();

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("notifications");
};
