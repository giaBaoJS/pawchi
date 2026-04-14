import { useRef } from 'react';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';
import { useToast } from 'heroui-native';

export function useShareCard() {
  const viewShotRef = useRef<ViewShot>(null);
  const { toast } = useToast();

  async function captureCard(): Promise<string | null> {
    try {
      const uri = await viewShotRef.current?.capture?.();
      return uri ?? null;
    } catch {
      toast.show({ label: 'Capture failed', description: 'Could not generate share card.' });
      return null;
    }
  }

  async function shareCard() {
    const uri = await captureCard();
    if (!uri) return;

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      toast.show({ label: 'Sharing not available on this device.' });
      return;
    }

    await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your Pawchi!' });
  }

  async function saveToPhotos() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      toast.show({ label: 'Permission denied', description: 'Allow photo access in Settings.' });
      return;
    }

    const uri = await captureCard();
    if (!uri) return;

    await MediaLibrary.saveToLibraryAsync(uri);
    toast.show({ label: '✅ Saved to Photos!' });
  }

  async function copyImage() {
    const uri = await captureCard();
    if (!uri) return;

    await Clipboard.setImageAsync(uri);
    toast.show({ label: '📋 Copied to clipboard!' });
  }

  return { viewShotRef, shareCard, saveToPhotos, copyImage };
}
