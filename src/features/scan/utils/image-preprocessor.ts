import * as ImageManipulator from 'expo-image-manipulator';

const MAX_DIMENSION = 1024;
const TARGET_SIZE_BYTES = 400 * 1024; // 400 KB

interface PreprocessResult {
  base64: string;
  uri: string;
}

async function processAtQuality(uri: string, quality: number): Promise<PreprocessResult> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { format: ImageManipulator.SaveFormat.JPEG, compress: quality / 100, base64: true },
  );

  if (!result.base64) throw new Error('Base64 encoding failed');
  return { base64: result.base64, uri: result.uri };
}

/**
 * Resizes and compresses a photo URI to base64 < 400 KB for the AI pipeline.
 * Tries quality 85 → 75 → 65 until under the size limit.
 */
export async function preprocessImage(photoUri: string): Promise<PreprocessResult> {
  for (const quality of [85, 75, 65]) {
    const result = await processAtQuality(photoUri, quality);
    const sizeBytes = (result.base64.length * 3) / 4;
    if (sizeBytes < TARGET_SIZE_BYTES) return result;
  }

  // Force last attempt even if over limit
  return processAtQuality(photoUri, 65);
}
