/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("call_deals", function (table) {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table
      .uuid("column_id")
      .nullable()
      .references("id")
      .inTable("deal_columns")
      .onDelete("SET NULL");
    table
      .uuid("contact_id")
      .nullable()
      .references("id")
      .inTable("contacts")
      .onDelete("SET NULL");
    table
      .uuid("assigned_to")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("phone", 30).notNullable();
    table.string("name", 255);
    table.text("description");
    table.timestamp("callback_at").nullable();
    table.integer("position").defaultTo(0);
    table
      .uuid("created_by")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("call_deals");
};
