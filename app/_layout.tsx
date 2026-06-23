import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useDatabaseSetup } from '@/db/use-database-setup';

export default function RootLayout() {
  const { ready, error } = useDatabaseSetup();

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Could not open the database</Text>
        <Text style={styles.errorBody}>Please restart the app.</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerTitleStyle: { fontWeight: '600' } }}>
        <Stack.Screen name="index" options={{ title: 'Receiptly' }} />
        <Stack.Screen name="capture" options={{ title: 'Capture receipt' }} />
        <Stack.Screen name="review" options={{ title: 'Review' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
        <Stack.Screen name="expense/[id]" options={{ title: 'Expense' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  errorBody: { color: '#6B7280' },
});
