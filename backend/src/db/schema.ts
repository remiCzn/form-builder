import { sql } from "drizzle-orm";
import {
  index,
  int,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
});

export const formsTable = sqliteTable(
  "forms",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    status: text("status", { enum: ["DRAFT", "PUBLISHED"] })
      .notNull()
      .default("DRAFT"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }), // nullable
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    uniqueIndex("forms_slug_unique").on(table.slug),
    index("forms_status_idx").on(table.status),
    index("forms_updated_at_idx").on(table.updatedAt),
  ],
);

export type Form = typeof formsTable.$inferSelect;

export const fieldsTable = sqliteTable(
  "fields",
  {
    id: text("id").primaryKey().notNull(),
    formId: text("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["TEXT", "NUMBER", "DROPDOWN"] })
      .notNull()
      .default("TEXT"),
    label: text("label").notNull(),
    required: integer("required", { mode: "boolean" }).notNull().default(false),
    order: integer("order").notNull().default(0),
    config: text("config", { mode: "json" }).$type<Record<string, unknown>>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("fields_form_id_idx").on(table.formId),
    index("fields_order_idx").on(table.formId, table.order),
  ],
);

export type Field = typeof fieldsTable.$inferSelect;
