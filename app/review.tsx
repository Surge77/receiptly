import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  buildExpenseFromForm,
  isFormSavable,
  parsedToInitialForm,
} from '@/services/expense-draft';
import { useExpenseStore } from '@/state/expense-store';

export default function ReviewScreen() {
  const params = useLocalSearchParams<{ imageUri?: string; rawText?: string }>();
  const rawText = params.rawText ?? '';
  const { categories, addExpense, loadCategories } = useExpenseStore();

  const initial = useMemo(() => parsedToInitialForm(rawText), [rawText]);

  const [amount, setAmount] = useState(initial.amount);
  const [date, setDate] = useState(initial.date);
  const [merchant, setMerchant] = useState(initial.merchant);
  const [note, setNote] = useState(initial.note);
  const [categoryName, setCategoryName] = useState(initial.categoryName);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const form = { amount, date, merchant, note, categoryName };
  const canSave = isFormSavable(form);

  async function onSave() {
    const draft = buildExpenseFromForm(form, categories, params.imageUri ?? null, rawText);
    if (!draft) return;
    await addExpense(draft);
    router.replace('/');
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
      >
        <Text style={styles.saveText}>Save expense</Text>
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
