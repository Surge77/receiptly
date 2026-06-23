import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  color: text('color').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const expenses = sqliteTable(
  'expenses',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    // Stored in minor units (paise) — never floats, to avoid currency drift.
    amount: integer('amount').notNull(),
    currency: text('currency').notNull().default('INR'),
    merchant: text('merchant'),
    categoryId: integer('category_id').references(() => categories.id),
    spentAt: integer('spent_at').notNull(),
    note: text('note'),
    imageUri: text('image_uri'),
    rawOcrText: text('raw_ocr_text'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index('idx_expenses_spent_at').on(table.spentAt),
    index('idx_expenses_category_id').on(table.categoryId),
  ],
);

export type CategoryRow = typeof categories.$inferSelect;
export type ExpenseRow = typeof expenses.$inferSelect;
export type NewExpenseRow = typeof expenses.$inferInsert;
