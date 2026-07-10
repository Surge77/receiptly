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
import { layout, mono, paper, type } from '@/theme';

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
      <Text style={styles.sectionTitle}>* CATEGORIES *</Text>
      {categories.map((c) => (
        <View key={c.id} style={styles.row} accessibilityLabel={`Category ${c.name}`}>
          <View style={[styles.swatch, { backgroundColor: c.color }]} />
          <Text style={styles.rowLabel}>{c.name}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>* ADD CATEGORY *</Text>
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
  container: { padding: layout.screenPad, gap: 12, backgroundColor: paper.bg },
  sectionTitle: { ...type.label, textAlign: 'center', marginTop: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    ...layout.tearline,
  },
  swatch: { width: 18, height: 18, borderRadius: 2 },
  rowLabel: { ...type.body, fontWeight: '600' },
  input: {
    fontFamily: mono,
    borderWidth: 1.5,
    borderColor: paper.ink,
    borderRadius: 3,
    backgroundColor: paper.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: paper.ink,
  },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorDot: { width: 32, height: 32, borderRadius: 3 },
  colorDotActive: { borderWidth: 3, borderColor: paper.ink },
  save: {
    backgroundColor: paper.accent,
    borderRadius: 3,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  saveDisabled: { opacity: 0.4 },
  saveText: {
    fontFamily: mono,
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
