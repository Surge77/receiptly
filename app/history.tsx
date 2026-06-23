import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { toCsv } from '@/lib/csv';
import { monthKey } from '@/lib/date';
import { formatINR } from '@/lib/money';
import { exportExpensesCsv } from '@/services/export';
import { useExpenseStore } from '@/state/expense-store';

export default function HistoryScreen() {
  const { expenses, categories, loadExpenses, loadCategories } = useExpenseStore();
  const [search, setSearch] = useState('');

  const onExport = useCallback(async () => {
    if (expenses.length === 0) return;
    if (categories.length === 0) await loadCategories();
    const latestCategories = useExpenseStore.getState().categories;
    await exportExpensesCsv(toCsv(expenses, latestCategories));
  }, [expenses, categories, loadCategories]);

  const reload = useCallback(
    (term: string) => {
      void loadExpenses(term.trim() ? { search: term.trim() } : undefined);
    },
    [loadExpenses],
  );

  useFocusEffect(
    useCallback(() => {
      reload(search);
    }, [reload, search]),
  );

  return (
    <View style={styles.container}>
      <TextInput
        value={search}
        onChangeText={(t) => {
          setSearch(t);
          reload(t);
        }}
        placeholder="Search merchant or note"
        style={styles.search}
        accessibilityLabel="Search expenses"
      />
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
