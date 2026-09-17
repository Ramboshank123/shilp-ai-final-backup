/**
 * On-device product image enhancement used by the AI Product Studio.
 *
 * This is the clearly-labelled demo pipeline: it crops to a square, lifts
 * brightness/contrast and warms the image against a clean catalogue backdrop.
 * A hosted background-removal / relighting API can be swapped in behind
 * `enhanceProductImage` without touching any screen code — keep the API key
 * on the server (a createServerFn in src/lib/ai.functions.ts), never here.
 */
export async function enhanceProductImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 900, 900);
  ctx.filter = "brightness(1.08) contrast(1.12) saturate(1.15)";
  ctx.drawImage(
    bitmap,
    (bitmap.width - size) / 2,
    (bitmap.height - size) / 2,
    size,
    size,
    0,
    0,
    900,
    900,
  );

  // Studio lighting boost
  ctx.filter = "none";
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(0, 0, 900, 900);

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", 0.9);
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image"));
    reader.readAsDataURL(blob);
  });
}
