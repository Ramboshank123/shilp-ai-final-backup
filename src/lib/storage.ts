import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";

/**
 * Uploads a product image to Cloud storage under
 * product-images/{userId}/{productKey}/{original|processed}/file.jpg
 * and returns the storage path (not a public URL — the bucket is private).
 */
export async function uploadProductImage(
  userId: string,
  productKey: string,
  kind: "original" | "processed",
  blob: Blob,
): Promise<string> {
  const path = `${userId}/${productKey}/${kind}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  return path;
}

const signedCache = new Map<string, string>();

/** Synchronously prefixes asset paths with Vite BASE_URL for GitHub Pages support. */
export function getAssetUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const base = import.meta.env.BASE_URL || "/";
  if (path.startsWith("/")) {
    return base.endsWith("/") ? `${base}${path.slice(1)}` : `${base}${path}`;
  }
  return `${base}${path}`;
}

/** Turns a stored value into a displayable URL (demo assets pass through and are base-normalized). */
export async function resolveImageUrl(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (value.startsWith("http") || value.startsWith("data:") || value.startsWith("blob:"))
    return value;
  if (value.startsWith("/")) {
    return getAssetUrl(value);
  }
  const cached = signedCache.get(value);
  if (cached) return cached;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(value, 60 * 60);
  if (error || !data) return null;
  signedCache.set(value, data.signedUrl);
  return data.signedUrl;
}
