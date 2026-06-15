exports.up = function (knex) {
  return (
    knex.schema
      .table("companies", (table) => {
        table.string("secret_code", 64).unique();
        table
          .uuid("owner_id")
          .references("id")
          .inTable("users")
          .onDelete("SET NULL");
        table.string("description", 500);
        table.string("website", 255).nullable().alter();
        table.string("industry", 255).nullable().alter();
      })
      // Добавить company_id в users
      .table("users", (table) => {
        table
          .uuid("company_id")
          .nullable()
          .references("id")
          .inTable("companies")
          .onDelete("SET NULL");
      })
  );
};

exports.down = function (knex) {
  return knex.schema
    .table("companies", (table) => {
      table.dropColumn("secret_code");
      table.dropColumn("owner_id");
      table.dropColumn("description");
    })
    .table("users", (table) => {
      table.dropColumn("company_id");
    });
};
