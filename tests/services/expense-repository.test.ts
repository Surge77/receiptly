import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as schema from '@/db/schema';
import { createExpenseRepository, type AppDatabase } from '@/services/expense-repository';
import { isoDateToEpochMs } from '@/lib/date';

const MIGRATION = join(__dirname, '../../drizzle/0000_violet_marrow.sql');

function makeRepo() {
  const sqlite = new Database(':memory:');
  const ddl = readFileSync(MIGRATION, 'utf8').replace(/-->.*statement-breakpoint/g, '');
  sqlite.exec(ddl);
  const db = drizzle(sqlite, { schema });
  // Seed one category for FK references.
  db.insert(schema.categories).values({ name: 'Food', color: '#EF4444' }).run();
  return { repo: createExpenseRepository(db as unknown as AppDatabase), db };
}

const baseExpense = (overrides = {}) => ({
  amountMinor: 45000,
  merchant: 'Swiggy',
  categoryId: 1,
  spentAt: isoDateToEpochMs('2024-05-12'),
  ...overrides,
});

describe('ExpenseRepository', () => {
  it('creates and reads back an expense', async () => {
    const { repo } = makeRepo();
    const created = await repo.create(baseExpense());
    expect(created.id).toBeGreaterThan(0);
    expect(created.amountMinor).toBe(45000);
    expect(created.currency).toBe('INR');

    const fetched = await repo.getById(created.id);
    expect(fetched?.merchant).toBe('Swiggy');
  });

  it('returns null for a missing id', async () => {
    const { repo } = makeRepo();
    expect(await repo.getById(999)).toBeNull();
  });

  it('lists expenses newest-first', async () => {
    const { repo } = makeRepo();
    await repo.create(baseExpense({ spentAt: isoDateToEpochMs('2024-01-01'), merchant: 'Old' }));
    await repo.create(baseExpense({ spentAt: isoDateToEpochMs('2024-06-01'), merchant: 'New' }));
    const list = await repo.list();
    expect(list.map((e) => e.merchant)).toEqual(['New', 'Old']);
  });

  it('filters by month', async () => {
    const { repo } = makeRepo();
    await repo.create(baseExpense({ spentAt: isoDateToEpochMs('2024-05-10') }));
    await repo.create(baseExpense({ spentAt: isoDateToEpochMs('2024-06-10') }));
    const may = await repo.list({ month: '2024-05' });
    expect(may).toHaveLength(1);
  });

  it('filters by search across merchant and note', async () => {
    const { repo } = makeRepo();
    await repo.create(baseExpense({ merchant: 'Uber', note: null }));
    await repo.create(baseExpense({ merchant: 'Shop', note: 'cab fare' }));
    expect(await repo.list({ search: 'uber' })).toHaveLength(1);
    expect(await repo.list({ search: 'cab' })).toHaveLength(1);
  });

  it('treats LIKE metacharacters in search as literals', async () => {
    const { repo } = makeRepo();
    await repo.create(baseExpense({ merchant: '50% off store' }));
    await repo.create(baseExpense({ merchant: 'Regular shop' }));
    // '%' must match the literal percent, not act as a wildcard over all rows.
    expect(await repo.list({ search: '50%' })).toHaveLength(1);
    expect(await repo.list({ search: '%' })).toHaveLength(1);
  });

  it('filters by category', async () => {
    const { repo, db } = makeRepo();
    db.insert(schema.categories).values({ name: 'Transport', color: '#3B82F6' }).run();
    await repo.create(baseExpense({ categoryId: 1 }));
    await repo.create(baseExpense({ categoryId: 2 }));
    expect(await repo.list({ categoryId: 2 })).toHaveLength(1);
  });

  it('updates an expense', async () => {
    const { repo } = makeRepo();
    const created = await repo.create(baseExpense());
    const updated = await repo.update(created.id, { amountMinor: 50000, note: 'edited' });
    expect(updated.amountMinor).toBe(50000);
    expect(updated.note).toBe('edited');
  });

  it('throws when updating a missing expense', async () => {
    const { repo } = makeRepo();
    await expect(repo.update(999, { amountMinor: 1 })).rejects.toThrow();
  });

  it('removes an expense', async () => {
    const { repo } = makeRepo();
    const created = await repo.create(baseExpense());
    await repo.remove(created.id);
    expect(await repo.getById(created.id)).toBeNull();
  });

  it('aggregates monthly totals by category', async () => {
    const { repo, db } = makeRepo();
    db.insert(schema.categories).values({ name: 'Transport', color: '#3B82F6' }).run();
    await repo.create(baseExpense({ categoryId: 1, amountMinor: 10000 }));
    await repo.create(baseExpense({ categoryId: 1, amountMinor: 15000 }));
    await repo.create(baseExpense({ categoryId: 2, amountMinor: 30000 }));

    const totals = await repo.monthlyByCategory('2024-05');
    const food = totals.find((t) => t.categoryName === 'Food');
    const transport = totals.find((t) => t.categoryName === 'Transport');
    expect(food?.totalMinor).toBe(25000);
    expect(transport?.totalMinor).toBe(30000);
  });
});
