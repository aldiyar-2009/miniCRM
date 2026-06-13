/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) =>
  Promise.all([
    knex.schema.table("deals", (t) => {
      t.index("owner_id");
      t.index("stage");
      t.index("created_at");
    }),
    knex.schema.table("call_deals", (t) => {
      t.index("column_id");
      t.index("assigned_to");
      t.index("callback_at");
    }),
  ]);

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) =>
  Promise.all([
    knex.schema.table("deals", (t) => {
      t.dropIndex("owner_id");
      t.dropIndex("stage");
      t.dropIndex("created_at");
    }),
    knex.schema.table("call_deals", (t) => {
      t.dropIndex("column_id");
      t.dropIndex("assigned_to");
      t.dropIndex("callback_at");
    }),
  ]);
