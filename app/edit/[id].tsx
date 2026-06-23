import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { db } from '@/db/client';
import { buildExpenseFromForm, expenseToForm, isFormSavable } from '@/services/expense-draft';
import { createExpenseRepository } from '@/services/expense-repository';
import { useExpenseStore } from '@/state/expense-store';
import type { Expense } from '@/types';

const repo = createExpenseRepository(db);

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenseId = Number(id);
  const { categories, editExpense, loadCategories } = useExpenseStore();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!Number.isInteger(expenseId)) return; // malformed/absent route param
    void repo.getById(expenseId).then((e) => {
      if (!e) return;
      setExpense(e);
      const form = expenseToForm(e, useExpenseStore.getState().categories);
      setAmount(form.amount);
      setDate(form.date);
      setMerchant(form.merchant);
      setNote(form.note);
      setCategoryName(form.categoryName);
    });
  }, [expenseId]);

  if (!expense) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Expense not found.</Text>
      </View>
    );
  }

  const form = { amount, date, merchant, note, categoryName };
  const canSave = isFormSavable(form);

  async function onSave() {
    if (!expense) return;
    const draft = buildExpenseFromForm(form, categories, expense.imageUri, expense.rawOcrText ?? '');
    if (!draft) return;
    try {
      await editExpense(expenseId, draft);
      router.back();
    } catch (e) {
      if (__DEV__) console.error('Failed to update expense', e);
      Alert.alert('Could not save', 'Something went wrong saving this expense. Please try again.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Field label="Amount (₹)">
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          style={styles.input}
          placeholder="0.00"
          accessibilityLabel="Amount in rupees"
        />
      </Field>

      <Field label="Date">
        <TextInput
          value={date}
          onChangeText={setDate}
          style={styles.input}
          placeholder="YYYY-MM-DD"
          accessibilityLabel="Date"
        />
      </Field>

      <Field label="Merchant">
        <TextInput
          value={merchant}
          onChangeText={setMerchant}
          style={styles.input}
          placeholder="Where you spent"
          accessibilityLabel="Merchant"
        />
      </Field>

      <Field label="Category">
        <View style={styles.chips}>
          {categories.map((c) => {
            const active = c.name === categoryName;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategoryName(c.name)}
                style={[styles.chip, active && { backgroundColor: c.color }]}
                accessibilityRole="button"
                accessibilityLabel={`Category ${c.name}`}
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </Field>

      <Field label="Note (optional)">
        <TextInput
          value={note}
          onChangeText={setNote}
          style={styles.input}
          placeholder="Add a note"
          accessibilityLabel="Note"
        />
      </Field>

      <Pressable
        style={[styles.save, !canSave && styles.saveDisabled]}
        onPress={onSave}
        disabled={!canSave}
        accessibilityRole="button"
        accessibilityLabel="Save changes"
      >
        <Text style={styles.saveText}>Save changes</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#9CA3AF' },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  chipText: { color: '#111827', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  save: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveDisabled: { opacity: 0.5 },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
