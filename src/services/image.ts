import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Cap the longest edge so OCR runs fast and stored images stay small.
export const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.7;

/**
 * Downscale a captured photo so its longest edge is <= MAX_EDGE_PX and
 * re-encode as JPEG. Returns the new file URI. Skips resizing if already small.
 */
export async function compressForOcr(uri: string, width: number, height: number): Promise<string> {
  const longest = Math.max(width, height);
  const context = ImageManipulator.manipulate(uri);

  if (longest > MAX_EDGE_PX) {
    const scale = MAX_EDGE_PX / longest;
    context.resize({ width: Math.round(width * scale), height: Math.round(height * scale) });
  }

  const image = await context.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
  return result.uri;
}
