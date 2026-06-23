import { Link, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { monthKey } from '@/lib/date';
import { formatINR } from '@/lib/money';
import { useExpenseStore } from '@/state/expense-store';

export default function DashboardScreen() {
  const { expenses, monthTotals, loadExpenses, loadMonth } = useExpenseStore();

  useFocusEffect(
    useCallback(() => {
      const thisMonth = monthKey(Date.now());
      void loadExpenses({ month: thisMonth });
      void loadMonth(thisMonth);
    }, [loadExpenses, loadMonth]),
  );

  const monthTotal = monthTotals.reduce((sum, t) => sum + t.totalMinor, 0);

  return (
    <View style={styles.container}>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>This month</Text>
        <Text style={styles.totalValue}>{formatINR(monthTotal)}</Text>
      </View>

      <Text style={styles.sectionTitle}>By category</Text>
      {monthTotals.length === 0 ? (
        <Text style={styles.empty}>No spending recorded yet.</Text>
      ) : (
        monthTotals.map((t) => (
          <View key={t.categoryId ?? 'uncategorized'} style={styles.row}>
            <Text style={styles.rowLabel}>{t.categoryName ?? 'Uncategorized'}</Text>
            <Text style={styles.rowValue}>{formatINR(t.totalMinor)}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Recent</Text>
      <FlatList
        data={expenses.slice(0, 10)}
        keyExtractor={(e) => String(e.id)}
        ListEmptyComponent={<Text style={styles.empty}>Snap your first receipt.</Text>}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/expense/[id]', params: { id: item.id } }} asChild>
            <Pressable style={styles.row}>
              <Text style={styles.rowLabel}>{item.merchant ?? 'Unknown'}</Text>
              <Text style={styles.rowValue}>{formatINR(item.amountMinor)}</Text>
            </Pressable>
          </Link>
        )}
      />

      <View style={styles.actions}>
        <Link href="/history" asChild>
          <Pressable style={[styles.button, styles.buttonSecondary]} accessibilityRole="button">
            <Text style={styles.buttonSecondaryText}>History</Text>
          </Pressable>
        </Link>
        <Link href="/capture" asChild>
          <Pressable style={styles.button} accessibilityRole="button">
            <Text style={styles.buttonText}>Capture</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  totalCard: { backgroundColor: '#111827', borderRadius: 16, padding: 20 },
  totalLabel: { color: '#9CA3AF', fontSize: 14 },
  totalValue: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 15, fontWeight: '600' },
  empty: { color: '#9CA3AF', paddingVertical: 12 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 'auto' },
  button: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonSecondary: { backgroundColor: '#E5E7EB' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  buttonSecondaryText: { color: '#111827', fontWeight: '600', fontSize: 16 },
});
