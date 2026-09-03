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

  ctx.fillStyle = "#fbf7ef";
  ctx.fillRect(0, 0, 900, 900);
  ctx.filter = "brightness(1.08) contrast(1.12) saturate(1.1)";
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

  // Soft vignette-free warm wash to imitate studio lighting.
  ctx.filter = "none";
  const gradient = ctx.createRadialGradient(450, 380, 80, 450, 450, 700);
  gradient.addColorStop(0, "rgba(255,250,240,0.18)");
  gradient.addColorStop(1, "rgba(255,246,232,0)");
  ctx.fillStyle = gradient;
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
