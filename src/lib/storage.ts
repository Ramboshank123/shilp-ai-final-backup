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

/** Turns a stored value into a displayable URL (demo assets pass through). */
export async function resolveImageUrl(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (value.startsWith("/") || value.startsWith("http") || value.startsWith("data:")) return value;
  const cached = signedCache.get(value);
  if (cached) return cached;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(value, 60 * 60);
  if (error || !data) return null;
  signedCache.set(value, data.signedUrl);
  return data.signedUrl;
}
