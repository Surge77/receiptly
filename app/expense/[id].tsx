import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { db, schema } from '@/db/client';
import { monthKey } from '@/lib/date';
import { formatINR } from '@/lib/money';
import { createExpenseRepository } from '@/services/expense-repository';
import { useExpenseStore } from '@/state/expense-store';
import type { Expense } from '@/types';

const repo = createExpenseRepository(db);

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenseId = Number(id);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  useEffect(() => {
    void repo.getById(expenseId).then(async (e) => {
      setExpense(e);
      if (e?.categoryId != null) {
        const cats = await db.select().from(schema.categories);
        setCategoryName(cats.find((c) => c.id === e.categoryId)?.name ?? null);
      }
    });
  }, [expenseId]);

  if (!expense) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Expense not found.</Text>
      </View>
    );
  }

  function onDelete() {
    Alert.alert('Delete expense?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(expenseId);
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.amount}>{formatINR(expense.amountMinor)}</Text>
      <Detail label="Merchant" value={expense.merchant ?? 'Unknown'} />
      <Detail label="Category" value={categoryName ?? 'Uncategorized'} />
      <Detail label="Date" value={monthKey(expense.spentAt)} />
      {expense.note ? <Detail label="Note" value={expense.note} /> : null}

      <Pressable style={styles.delete} onPress={onDelete} accessibilityRole="button">
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#9CA3AF' },
  amount: { fontSize: 32, fontWeight: '700', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  label: { color: '#6B7280', fontSize: 15 },
  value: { fontSize: 15, fontWeight: '500' },
  delete: {
    marginTop: 'auto',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteText: { color: '#B91C1C', fontWeight: '600', fontSize: 16 },
});
