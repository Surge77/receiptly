import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { mlKitOcrService } from '@/services/ocr-service';

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <Centered>{<ActivityIndicator />}</Centered>;

  if (!permission.granted) {
    return (
      <Centered>
        <Text style={styles.message}>Camera access is needed to photograph receipts.</Text>
        <Pressable style={styles.button} onPress={requestPermission} accessibilityRole="button">
          <Text style={styles.buttonText}>Grant permission</Text>
        </Pressable>
      </Centered>
    );
  }

  async function onCapture() {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (!photo) return;
      const rawText = await mlKitOcrService.recognize(photo.uri).catch((e: unknown) => {
        if (__DEV__) console.warn('OCR failed; continuing with manual entry', e);
        return '';
      });
      router.replace({ pathname: '/review', params: { imageUri: photo.uri, rawText } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <Pressable
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={onCapture}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Capture receipt"
      >
        <Text style={styles.buttonText}>{busy ? 'Reading…' : 'Capture'}</Text>
      </Pressable>
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  camera: { flex: 1 },
  message: { textAlign: 'center', fontSize: 16 },
  button: {
    backgroundColor: '#2563EB',
    margin: 16,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
