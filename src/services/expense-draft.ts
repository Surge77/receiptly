import { isoDateToEpochMs, todayIso } from '@/lib/date';
import { minorToRupees, parseAmountToMinor } from '@/lib/money';
import { categorize } from '@/services/category-rules';
import { parse } from '@/services/receipt-parser';
import type { Category, NewExpense } from '@/types';

export interface ReviewForm {
  amount: string;
  date: string;
  merchant: string;
  note: string;
  categoryName: string;
}

/** Initial review-form values derived from raw OCR text. Pure. */
export function parsedToInitialForm(rawText: string): ReviewForm {
  const parsed = parse(rawText);
  return {
    amount: parsed.amountMinor !== null ? String(minorToRupees(parsed.amountMinor)) : '',
    date: parsed.date ?? todayIso(),
    merchant: parsed.merchant ?? '',
    note: '',
    categoryName: categorize(parsed.merchant),
  };
}

/** True when the form has a positive, parseable amount (the save precondition). */
export function isFormSavable(form: ReviewForm): boolean {
  const minor = parseAmountToMinor(form.amount);
  return minor !== null && minor > 0;
}

/**
 * Build a NewExpense from the edited form. Returns null when the amount is
 * missing/invalid. Pure — no DB, no navigation.
 */
export function buildExpenseFromForm(
  form: ReviewForm,
  categories: readonly Category[],
  imageUri: string | null,
  rawText: string,
): NewExpense | null {
  const amountMinor = parseAmountToMinor(form.amount);
  if (amountMinor === null || amountMinor <= 0) return null;

  const category = categories.find((c) => c.name === form.categoryName);
  return {
    amountMinor,
    merchant: form.merchant.trim() || null,
    categoryId: category?.id ?? null,
    spentAt: isoDateToEpochMs(form.date),
    note: form.note.trim() || null,
    imageUri: imageUri ?? null,
    rawOcrText: rawText || null,
  };
}
