import { Link, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryPieChart } from '@/components/category-pie-chart';
import { InkButton } from '@/components/ink-button';
import { ReceiptCard } from '@/components/receipt-card';
import { monthKey } from '@/lib/date';
import { formatINR } from '@/lib/money';
import { useExpenseStore } from '@/state/expense-store';
import { layout, paper, type } from '@/theme';

export default function DashboardScreen() {
  const { expenses, monthTotals, categories, loadExpenses, loadMonth, loadCategories } =
    useExpenseStore();

  useFocusEffect(
    useCallback(() => {
      const thisMonth = monthKey(Date.now());
      void loadCategories();
      void loadExpenses({ month: thisMonth });
      void loadMonth(thisMonth);
    }, [loadCategories, loadExpenses, loadMonth]),
  );

  const monthTotal = monthTotals.reduce((sum, t) => sum + t.totalMinor, 0);

  return (
    <View style={styles.container}>
      <ReceiptCard>
        <Text style={type.label}>This month · total</Text>
        <Text style={styles.totalValue}>{formatINR(monthTotal)}</Text>
        <View style={styles.totalRule} />
      </ReceiptCard>

      <Text style={styles.divider}>* BY CATEGORY *</Text>
      {monthTotals.length === 0 ? (
        <Text style={styles.empty}>NO SPENDING RECORDED YET</Text>
      ) : (
        <CategoryPieChart totals={monthTotals} categories={categories} />
      )}

      <Text style={styles.divider}>* RECENT *</Text>
      <FlatList
        data={expenses.slice(0, 10)}
        keyExtractor={(e) => String(e.id)}
        ListEmptyComponent={<Text style={styles.empty}>SNAP YOUR FIRST RECEIPT</Text>}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/expense/[id]', params: { id: item.id } }} asChild>
            <Pressable style={styles.row}>
              <Text style={styles.rowLabel} numberOfLines={1}>
                {(item.merchant ?? 'Unknown').toUpperCase()}
              </Text>
              <Text style={styles.rowDots} numberOfLines={1}>
                ............................
              </Text>
              <Text style={styles.rowValue}>{formatINR(item.amountMinor)}</Text>
            </Pressable>
          </Link>
        )}
      />

      <View style={styles.actions}>
        <Link href="/settings" asChild>
          <InkButton label="Setup" variant="ghost" />
        </Link>
        <Link href="/history" asChild>
          <InkButton label="History" variant="ghost" />
        </Link>
        <Link href="/capture" asChild>
          <InkButton label="Capture" variant="primary" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: layout.screenPad, gap: 10, backgroundColor: paper.bg },
  totalValue: { ...type.display, ...type.amount, fontSize: 40, marginTop: 6 },
  totalRule: {
    marginTop: 12,
    borderBottomWidth: 3,
    borderBottomColor: paper.ink,
    borderStyle: 'solid',
  },
  divider: {
    ...type.label,
    color: paper.inkFaded,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'baseline', paddingVertical: 11, gap: 6 },
  rowLabel: { ...type.body, fontWeight: '600', flexShrink: 1 },
  rowDots: { ...type.body, color: paper.inkFaint, flex: 1 },
  rowValue: { ...type.body, ...type.amount, fontSize: 14 },
  empty: { ...type.label, textAlign: 'center', paddingVertical: 14 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 'auto' },
});
