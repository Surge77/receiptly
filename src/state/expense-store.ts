import { create } from 'zustand';

import { db, schema } from '@/db/client';
import { createCategoryRepository } from '@/services/category-repository';
import { createExpenseRepository } from '@/services/expense-repository';
import type { Category, CategoryTotal, Expense, ExpenseFilter, NewExpense } from '@/types';

const repo = createExpenseRepository(db);
const categoryRepo = createCategoryRepository(db);

interface ExpenseState {
  expenses: Expense[];
  categories: Category[];
  monthTotals: CategoryTotal[];
  loadCategories: () => Promise<void>;
  addCategory: (name: string, color: string) => Promise<void>;
  loadExpenses: (filter?: ExpenseFilter) => Promise<void>;
  loadMonth: (month: string) => Promise<void>;
  addExpense: (e: NewExpense) => Promise<Expense>;
  editExpense: (id: number, patch: Partial<NewExpense>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  categories: [],
  monthTotals: [],

  async loadCategories() {
    const rows = await db.select().from(schema.categories);
    set({ categories: rows });
  },

  async addCategory(name, color) {
    await categoryRepo.add(name, color);
    await get().loadCategories();
  },

  async loadExpenses(filter) {
    set({ expenses: await repo.list(filter) });
  },

  async loadMonth(month) {
    set({ monthTotals: await repo.monthlyByCategory(month) });
  },

  async addExpense(e) {
    const created = await repo.create(e);
    await get().loadExpenses();
    return created;
  },

  async editExpense(id, patch) {
    await repo.update(id, patch);
    await get().loadExpenses();
  },

  async deleteExpense(id) {
    await repo.remove(id);
    await get().loadExpenses();
  },
}));
