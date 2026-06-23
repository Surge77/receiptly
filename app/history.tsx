import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { toCsv } from '@/lib/csv';
import { monthKey, recentMonths } from '@/lib/date';
import { formatINR } from '@/lib/money';
import { exportExpensesCsv } from '@/services/export';
import { useExpenseStore } from '@/state/expense-store';
import type { Category, ExpenseFilter } from '@/types';

const MONTH_COUNT = 6;

interface Chip {
  key: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

function ChipRow({ chips, label }: { chips: Chip[]; label: string }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipRow}
      contentContainerStyle={styles.chipRowContent}
      accessibilityLabel={label}
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          onPress={chip.onPress}
          accessibilityRole="button"
          accessibilityState={{ selected: chip.selected }}
          style={[styles.chip, chip.selected && styles.chipSelected]}
        >
          <Text style={[styles.chipText, chip.selected && styles.chipTextSelected]}>
            {chip.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default function HistoryScreen() {
  const { expenses, categories, loadExpenses, loadCategories } = useExpenseStore();
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

  const onExport = useCallback(async () => {
    if (expenses.length === 0) return;
    if (categories.length === 0) await loadCategories();
    const latestCategories = useExpenseStore.getState().categories;
    await exportExpensesCsv(toCsv(expenses, latestCategories));
  }, [expenses, categories, loadCategories]);

  const reload = useCallback(
    (term: string, selectedMonth: string | null, selectedCategoryId: number | undefined) => {
      const filter: ExpenseFilter = {};
      const trimmed = term.trim();
      if (trimmed) filter.search = trimmed;
      if (selectedMonth) filter.month = selectedMonth;
      if (selectedCategoryId !== undefined) filter.categoryId = selectedCategoryId;
      void loadExpenses(Object.keys(filter).length > 0 ? filter : undefined);
    },
    [loadExpenses],
  );

  useFocusEffect(
    useCallback(() => {
      void loadCategories();
      reload(search, month, categoryId);
    }, [reload, search, month, categoryId, loadCategories]),
  );

  const monthChips = useMemo<Chip[]>(() => {
    const allChip: Chip = {
      key: 'all-months',
      label: 'All',
      selected: month === null,
      onPress: () => setMonth(null),
    };
    const chips = recentMonths(MONTH_COUNT).map<Chip>((m) => ({
      key: m,
      label: m,
      selected: month === m,
      onPress: () => setMonth(m),
    }));
    return [allChip, ...chips];
  }, [month]);

  const categoryChips = useMemo<Chip[]>(() => {
    const allChip: Chip = {
      key: 'all-categories',
      label: 'All',
      selected: categoryId === undefined,
      onPress: () => setCategoryId(undefined),
    };
    const chips = categories.map<Chip>((c: Category) => ({
      key: String(c.id),
      label: c.name,
      selected: categoryId === c.id,
      onPress: () => setCategoryId(c.id),
    }));
    return [allChip, ...chips];
  }, [categories, categoryId]);

  return (
    <View style={styles.container}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search merchant or note"
        style={styles.search}
        accessibilityLabel="Search expenses"
      />
      <ChipRow chips={monthChips} label="Filter by month" />
      <ChipRow chips={categoryChips} label="Filter by category" />
      <Pressable
        onPress={() => void onExport()}
        disabled={expenses.length === 0}
        accessibilityRole="button"
        accessibilityLabel="Export expenses to CSV"
        style={[styles.exportButton, expenses.length === 0 && styles.exportButtonDisabled]}
      >
        <Text style={styles.exportButtonText}>Export CSV</Text>
      </Pressable>
      <FlatList
        data={expenses}
        keyExtractor={(e) => String(e.id)}
        ListEmptyComponent={<Text style={styles.empty}>No matching expenses.</Text>}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/expense/[id]', params: { id: item.id } }} asChild>
            <Pressable style={styles.row}>
              <View>
                <Text style={styles.merchant}>{item.merchant ?? 'Unknown'}</Text>
                <Text style={styles.date}>{monthKey(item.spentAt)}</Text>
              </View>
              <Text style={styles.amount}>{formatINR(item.amountMinor)}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  search: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  chipRow: { marginBottom: 12, flexGrow: 0 },
  chipRowContent: { gap: 8, paddingRight: 4 },
  chip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { fontSize: 14, color: '#374151' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  merchant: { fontSize: 16, fontWeight: '500' },
  date: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '600' },
  empty: { color: '#9CA3AF', paddingVertical: 24, textAlign: 'center' },
  exportButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  exportButtonDisabled: { backgroundColor: '#D1D5DB' },
  exportButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
