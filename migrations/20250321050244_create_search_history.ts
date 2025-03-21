import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("search_history", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("user_id").notNullable();
    table.text("search_query").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.foreign("user_id").references("users.id").onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTable("search_history");
}
