import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useExpenseStore } from '@/state/expense-store';

const PALETTE = [
  '#EF4444',
  '#F59E0B',
  '#22C55E',
  '#14B8A6',
  '#3B82F6',
  '#A855F7',
  '#EC4899',
  '#6B7280',
] as const;

export default function SettingsScreen() {
  const { categories, loadCategories, addCategory } = useExpenseStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(PALETTE[0]);

  useFocusEffect(
    useCallback(() => {
      void loadCategories();
    }, [loadCategories]),
  );

  const trimmed = name.trim();
  const canAdd = trimmed.length > 0;

  async function onAdd() {
    if (!canAdd) return;
    try {
      await addCategory(trimmed, color);
      setName('');
    } catch (e) {
      if (__DEV__) console.error('Failed to add category', e);
      Alert.alert('Could not add', 'Something went wrong adding this category. Please try again.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Categories</Text>
      {categories.map((c) => (
        <View key={c.id} style={styles.row} accessibilityLabel={`Category ${c.name}`}>
          <View style={[styles.swatch, { backgroundColor: c.color }]} />
          <Text style={styles.rowLabel}>{c.name}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Add category</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholder="Category name"
        accessibilityLabel="New category name"
      />

      <View style={styles.palette}>
        {PALETTE.map((c) => {
          const active = c === color;
          return (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c }, active && styles.colorDotActive]}
              accessibilityRole="button"
              accessibilityLabel={`Color ${c}`}
              accessibilityState={{ selected: active }}
            />
          );
        })}
      </View>

      <Pressable
        style={[styles.save, !canAdd && styles.saveDisabled]}
        onPress={onAdd}
        disabled={!canAdd}
        accessibilityRole="button"
        accessibilityLabel="Add category"
      >
        <Text style={styles.saveText}>Add category</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  swatch: { width: 20, height: 20, borderRadius: 6 },
  rowLabel: { fontSize: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 3, borderColor: '#111827' },
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
