exports.up = function(knex) {
  return knex.schema.dropTableIfExists("deal_stage_history");
};

exports.down = function(knex) {
  return knex.schema.createTable("deal_stage_history", function (table) {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table
      .uuid("deal_id")
      .notNullable()
      .references("id")
      .inTable("deals")
      .onDelete("CASCADE");
    table
      .uuid("changed_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.string("stage_from", 50).notNullable();
    table.string("stage_to", 50).notNullable();
    table.timestamp("changed_at").defaultTo(knex.fn.now());
  });
};
