/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("deals", function (table) {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table
      .uuid("company_id")
      .notNullable()
      .references("id")
      .inTable("companies")
      .onDelete("CASCADE");
    table
      .uuid("owner_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.string("title", 255).notNullable();
    table.decimal("amount", 15, 2);
    table.string("currency", 10).defaultTo("USD");
    table
      .enum("stage", [
        "lead",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ])
      .notNullable()
      .defaultTo("lead");
    table.date("close_date");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("deals");
};
