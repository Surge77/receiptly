import {
  buildExpenseFromForm,
  isFormSavable,
  parsedToInitialForm,
  type ReviewForm,
} from '@/services/expense-draft';
import { isoDateToEpochMs } from '@/lib/date';
import type { Category } from '@/types';

const CATEGORIES: Category[] = [
  { id: 1, name: 'Food', color: '#EF4444', createdAt: 0 },
  { id: 2, name: 'Transport', color: '#3B82F6', createdAt: 0 },
];

const form = (overrides: Partial<ReviewForm> = {}): ReviewForm => ({
  amount: '450',
  date: '2024-05-12',
  merchant: 'Swiggy',
  note: '',
  categoryName: 'Food',
  ...overrides,
});

describe('parsedToInitialForm', () => {
  it('prefills amount/date/merchant/category from OCR text', () => {
    const f = parsedToInitialForm('Swiggy\nGrand Total ₹450.00\n12/05/2024');
    expect(f.amount).toBe('450');
    expect(f.date).toBe('2024-05-12');
    expect(f.merchant).toBe('Swiggy');
    expect(f.categoryName).toBe('Food');
  });

  it('falls back to today and empty fields when nothing parses', () => {
    const f = parsedToInitialForm('');
    expect(f.amount).toBe('');
    expect(f.merchant).toBe('');
    expect(f.categoryName).toBe('Other');
    expect(f.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('isFormSavable', () => {
  it('requires a positive amount', () => {
    expect(isFormSavable(form({ amount: '450' }))).toBe(true);
    expect(isFormSavable(form({ amount: '0' }))).toBe(false);
    expect(isFormSavable(form({ amount: '' }))).toBe(false);
    expect(isFormSavable(form({ amount: 'abc' }))).toBe(false);
  });
});

describe('buildExpenseFromForm', () => {
  it('maps a valid form to a NewExpense in paise', () => {
    const draft = buildExpenseFromForm(form(), CATEGORIES, 'file://r.jpg', 'raw');
    expect(draft).not.toBeNull();
    expect(draft?.amountMinor).toBe(45000);
    expect(draft?.categoryId).toBe(1);
    expect(draft?.spentAt).toBe(isoDateToEpochMs('2024-05-12'));
    expect(draft?.imageUri).toBe('file://r.jpg');
    expect(draft?.rawOcrText).toBe('raw');
  });

  it('trims merchant/note to null when blank', () => {
    const draft = buildExpenseFromForm(form({ merchant: '  ', note: '  ' }), CATEGORIES, null, '');
    expect(draft?.merchant).toBeNull();
    expect(draft?.note).toBeNull();
    expect(draft?.rawOcrText).toBeNull();
  });

  it('returns null categoryId for an unknown category', () => {
    const draft = buildExpenseFromForm(form({ categoryName: 'Nope' }), CATEGORIES, null, '');
    expect(draft?.categoryId).toBeNull();
  });

  it('returns null for an invalid amount', () => {
    expect(buildExpenseFromForm(form({ amount: '0' }), CATEGORIES, null, '')).toBeNull();
  });
});
