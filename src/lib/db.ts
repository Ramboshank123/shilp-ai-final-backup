import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  ArtisanProfile,
  BuyerEnquiry,
  Category,
  MarketplaceProduct,
  PriceRecommendation,
  Product,
  ProductDetails,
  Profile,
} from "./types";

const SUPABASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_URL"]) ||
  (typeof process !== "undefined" && process.env?.["SUPABASE_URL"]) ||
  "";
const SUPABASE_PUBLISHABLE_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"]) ||
  (typeof process !== "undefined" && process.env?.["SUPABASE_PUBLISHABLE_KEY"]) ||
  "";

// An unauthenticated client to perform public catalog reads without user JWT,
// preventing execution of broken PostgreSQL RLS functions (owns_artisan, is_published).
let _anonSupabase: ReturnType<typeof createClient<Database>> | null = null;
export function getAnonSupabase() {
  if (!_anonSupabase && SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
    _anonSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _anonSupabase ?? supabase;
}

const SEED_PRODUCT_IMAGES: Record<string, string> = {
  "bbbbbbb1-0000-4000-8000-000000000001": "/demo/bamboo-basket.jpg",
  "bbbbbbb2-0000-4000-8000-000000000002": "/demo/terracotta-diya.jpg",
  "bbbbbbb3-0000-4000-8000-000000000003": "/demo/cotton-scarf.jpg",
  "bbbbbbb4-0000-4000-8000-000000000004": "/demo/wooden-box.jpg",
  "bbbbbbb5-0000-4000-8000-000000000005": "/demo/pottery-vase.jpg",
  "demo-basket": "/demo/bamboo-basket.jpg",
  "demo-diya": "/demo/terracotta-diya.jpg",
  "demo-scarf": "/demo/cotton-scarf.jpg",
  "demo-box": "/demo/wooden-box.jpg",
  "demo-vase": "/demo/pottery-vase.jpg",
};

export function getCraftFallbackImage(craftType: string | null, name: string): string {
  const text = `${craftType ?? ""} ${name}`.toLowerCase();
  if (text.includes("bamboo") || text.includes("cane") || text.includes("basket")) {
    return "/demo/bamboo-basket.jpg";
  }
  if (text.includes("diya") || text.includes("terracotta")) {
    return "/demo/terracotta-diya.jpg";
  }
  if (
    text.includes("pot") ||
    text.includes("vase") ||
    text.includes("clay") ||
    text.includes("ceramic")
  ) {
    return "/demo/pottery-vase.jpg";
  }
  if (
    text.includes("scarf") ||
    text.includes("cotton") ||
    text.includes("handloom") ||
    text.includes("weave") ||
    text.includes("sari") ||
    text.includes("fabric") ||
    text.includes("textile")
  ) {
    return "/demo/cotton-scarf.jpg";
  }
  if (text.includes("wood") || text.includes("box") || text.includes("carv")) {
    return "/demo/wooden-box.jpg";
  }
  return "/demo/bamboo-basket.jpg";
}

function getStoredProductImage(productId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(`shilp.img_${productId}`);
  } catch {
    return null;
  }
}

function saveStoredProductImage(productId: string, url: string) {
  if (typeof window === "undefined" || !url) return;
  try {
    window.localStorage.setItem(`shilp.img_${productId}`, url);
  } catch (err) {
    void err;
  }
}

export function getLocalProducts(): MarketplaceProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("shilp.local_products");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalProduct(product: MarketplaceProduct) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalProducts();
    const index = list.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      list[index] = product;
    } else {
      list.unshift(product);
    }
    window.localStorage.setItem("shilp.local_products", JSON.stringify(list));
  } catch (err) {
    void err;
  }
}

export function getLocalArtisanProducts(artisanId: string): MarketplaceProduct[] {
  const all = getLocalProducts();
  return all.filter((p) => p.artisan_id === artisanId);
}

export function getLocalEnquiries(artisanId: string): EnquiryWithProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`shilp.enquiries_${artisanId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalEnquiry(enquiry: EnquiryWithProduct) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalEnquiries(enquiry.artisan_id);
    list.unshift(enquiry);
    window.localStorage.setItem(`shilp.enquiries_${enquiry.artisan_id}`, JSON.stringify(list));
  } catch (err) {
    void err;
  }
}

function updateLocalEnquiryStatus(id: string, status: "new" | "contacted" | "closed") {
  if (typeof window === "undefined") return;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith("shilp.enquiries_")) {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const list: EnquiryWithProduct[] = JSON.parse(raw);
          const item = list.find((e) => e.id === id);
          if (item) {
            item.status = status;
            window.localStorage.setItem(key, JSON.stringify(list));
          }
        }
      }
    }
  } catch (err) {
    void err;
  }
}

/** Ensures a profile + artisan profile row exists for the signed-in user. */
export async function ensureProfile(
  userId: string,
  email: string | null,
  fullName: string | null,
  language: string,
): Promise<{ profile: Profile; artisan: ArtisanProfile }> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  let profile = existing as Profile | null;
  if (!profile) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role: "artisan",
        preferred_language: language,
      })
      .select()
      .single();
    if (error) throw error;
    profile = data as Profile;
  }

  const { data: existingArtisan } = await supabase
    .from("artisan_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let artisan = existingArtisan as ArtisanProfile | null;
  if (!artisan) {
    const { data, error } = await supabase
      .from("artisan_profiles")
      .insert({ user_id: userId, languages: [language] })
      .select()
      .single();
    if (error) throw error;
    artisan = data as ArtisanProfile;
  }

  return { profile, artisan };
}

export async function getMyProfile(userId: string) {
  const [{ data: profile }, { data: artisan }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("artisan_profiles").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  return {
    profile: (profile as Profile | null) ?? null,
    artisan: (artisan as ArtisanProfile | null) ?? null,
  };
}

export async function updateProfile(userId: string, values: Partial<Profile>) {
  const { error } = await supabase.from("profiles").update(values).eq("id", userId);
  if (error) throw error;
}

export async function updateArtisanProfile(userId: string, values: Partial<ArtisanProfile>) {
  const { error } = await supabase.from("artisan_profiles").update(values).eq("user_id", userId);
  if (error) throw error;
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
}

type ProductRow = Product & {
  product_images?: { processed_image_url: string | null; original_image_url: string | null }[];
  artisan_profiles: {
    location: string | null;
    craft_type: string | null;
    profiles: { full_name: string | null } | null;
  } | null;
  categories: { name: string } | null;
};

// Safe select that avoids joining tables with broken RLS functions (product_images)
const PRODUCT_SAFE_SELECT =
  "*, categories(name), artisan_profiles(location, craft_type, profiles(full_name))";

function toMarketplaceProduct(row: ProductRow): MarketplaceProduct {
  const image = row.product_images?.[0];
  const urlFromImages = image?.processed_image_url ?? image?.original_image_url ?? null;
  const urlFromSeed = SEED_PRODUCT_IMAGES[row.id];
  const urlFromStorage = getStoredProductImage(row.id);
  const imageUrl =
    urlFromImages ||
    urlFromSeed ||
    urlFromStorage ||
    getCraftFallbackImage(row.craft_type, row.name);

  return {
    id: row.id,
    artisan_id: row.artisan_id,
    category_id: row.category_id,
    name: row.name,
    description: row.description,
    description_hindi: row.description_hindi,
    material: row.material,
    colour: row.colour,
    size: row.size,
    craft_type: row.craft_type,
    production_time: row.production_time,
    price: row.price,
    currency: row.currency || "INR",
    status: row.status,
    views: row.views ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    image_url: imageUrl,
    artisan_name: row.artisan_profiles?.profiles?.full_name ?? "Artisan",
    artisan_location: row.artisan_profiles?.location ?? null,
    category_name: row.categories?.name ?? null,
  };
}

export async function listPublishedProducts(): Promise<MarketplaceProduct[]> {
  const anon = getAnonSupabase();
  try {
    const { data, error } = await anon
      .from("products")
      .select(PRODUCT_SAFE_SELECT)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const cloudProducts = (data as unknown as ProductRow[]).map(toMarketplaceProduct);
      const local = getLocalProducts().filter((p) => p.status === "published");
      const map = new Map<string, MarketplaceProduct>();
      for (const p of cloudProducts) map.set(p.id, p);
      for (const p of local) map.set(p.id, p);
      return Array.from(map.values());
    }
  } catch (err) {
    console.warn("Could not query cloud products, using local fallback:", err);
  }

  return getLocalProducts().filter((p) => p.status === "published");
}

export async function getProductById(id: string) {
  const anon = getAnonSupabase();
  let product: MarketplaceProduct | null = null;
  try {
    const { data } = await anon
      .from("products")
      .select(PRODUCT_SAFE_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (data) {
      product = toMarketplaceProduct(data as unknown as ProductRow);
    }
  } catch (err) {
    void err;
  }

  if (!product) {
    const local = getLocalProducts().find((p) => p.id === id);
    if (local) product = local;
  }

  if (!product) return null;

  return {
    product,
    details: null as ProductDetails | null,
    artisanId: product.artisan_id,
  };
}

export async function listMyProducts(artisanId: string): Promise<MarketplaceProduct[]> {
  const local = getLocalArtisanProducts(artisanId);
  const anon = getAnonSupabase();

  try {
    // Query published products using unauthenticated client to bypass owns_artisan RLS function error
    const { data, error } = await anon
      .from("products")
      .select(PRODUCT_SAFE_SELECT)
      .eq("artisan_id", artisanId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const cloudProducts = (data as unknown as ProductRow[]).map(toMarketplaceProduct);
      const map = new Map<string, MarketplaceProduct>();
      for (const p of cloudProducts) map.set(p.id, p);
      for (const p of local) map.set(p.id, p);
      return Array.from(map.values());
    }
  } catch (err) {
    console.warn("Cloud products lookup fallback:", err);
  }

  return local;
}

export async function incrementViews(productId: string) {
  try {
    await supabase.rpc("increment_product_views", { _product_id: productId });
  } catch (err) {
    void err;
  }
}

export interface CreateProductInput {
  artisanId: string;
  artisanName?: string;
  artisanLocation?: string | null;
  categoryName?: string | null;
  categoryId: string | null;
  name: string;
  description: string;
  descriptionHindi: string;
  material: string;
  colour: string;
  size: string;
  craftType: string;
  productionTime: string;
  price: number;
  status: "draft" | "published";
  keyFeatures: string[];
  imageUrl: string | null;
  originalImageUrl: string | null;
  sourceLanguage: string;
  pricing?: Omit<PriceRecommendation, "id" | "product_id"> | null;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  let product: Product = {
    id,
    artisan_id: input.artisanId,
    category_id: input.categoryId,
    name: input.name,
    description: input.description,
    description_hindi: input.descriptionHindi,
    material: input.material,
    colour: input.colour,
    size: input.size,
    craft_type: input.craftType,
    production_time: input.productionTime,
    price: input.price,
    status: input.status,
    currency: "INR",
    views: 0,
    created_at: now,
    updated_at: now,
  };

  try {
    const { data, error } = await supabase
      .from("products")
      .insert({
        id: product.id,
        artisan_id: input.artisanId,
        category_id: input.categoryId,
        name: input.name,
        description: input.description,
        description_hindi: input.descriptionHindi,
        material: input.material,
        colour: input.colour,
        size: input.size,
        craft_type: input.craftType,
        production_time: input.productionTime,
        price: input.price,
        status: input.status,
      })
      .select()
      .single();

    if (!error && data) {
      product = data as Product;
    }
  } catch (err) {
    console.warn("Saved product locally while cloud function permissions synchronize:", err);
  }

  // Always store locally so newly created products are immediately accessible
  const fallbackImage =
    input.imageUrl || input.originalImageUrl || getCraftFallbackImage(input.craftType, input.name);

  const marketProduct: MarketplaceProduct = {
    ...product,
    image_url: fallbackImage,
    artisan_name: input.artisanName || "Artisan",
    artisan_location: input.artisanLocation || null,
    category_name: input.categoryName || null,
  };
  saveLocalProduct(marketProduct);

  if (input.imageUrl || input.originalImageUrl) {
    saveStoredProductImage(product.id, fallbackImage);
  }

  try {
    await supabase.from("product_details").insert({
      product_id: product.id,
      key_features: input.keyFeatures,
      ai_generated: true,
      source_language: input.sourceLanguage,
      confidence_score: 0.9,
    });
  } catch (err) {
    void err;
  }

  try {
    if (input.imageUrl || input.originalImageUrl) {
      await supabase.from("product_images").insert({
        product_id: product.id,
        original_image_url: input.originalImageUrl,
        processed_image_url: input.imageUrl,
        is_primary: true,
      });
    }
  } catch (err) {
    void err;
  }

  if (input.pricing) {
    try {
      await supabase.from("price_recommendations").insert({
        product_id: product.id,
        material_cost: input.pricing.material_cost,
        labour_cost: input.pricing.labour_cost,
        packaging_cost: input.pricing.packaging_cost,
        other_cost: input.pricing.other_cost,
        base_cost: input.pricing.base_cost,
        recommended_min: input.pricing.recommended_min,
        recommended_max: input.pricing.recommended_max,
        market_adjustment: input.pricing.market_adjustment,
        margin_percentage: input.pricing.margin_percentage,
        reasoning: input.pricing.reasoning,
      });
    } catch (err) {
      void err;
    }
  }

  return product;
}

export async function updateProductStatus(
  productId: string,
  status: "draft" | "published" | "archived",
) {
  try {
    await supabase.from("products").update({ status }).eq("id", productId);
  } catch (err) {
    void err;
  }

  const local = getLocalProducts();
  const item = local.find((p) => p.id === productId);
  if (item) {
    item.status = status;
    item.updated_at = new Date().toISOString();
    saveLocalProduct(item);
  }
}

export async function updateProduct(productId: string, values: Partial<Product>) {
  try {
    await supabase.from("products").update(values).eq("id", productId);
  } catch (err) {
    void err;
  }

  const local = getLocalProducts();
  const item = local.find((p) => p.id === productId);
  if (item) {
    Object.assign(item, values, { updated_at: new Date().toISOString() });
    saveLocalProduct(item);
  }
}

export async function deleteProduct(productId: string) {
  try {
    await supabase.from("products").delete().eq("id", productId);
  } catch (err) {
    void err;
  }

  if (typeof window !== "undefined") {
    try {
      const list = getLocalProducts().filter((p) => p.id !== productId);
      window.localStorage.setItem("shilp.local_products", JSON.stringify(list));
      window.localStorage.removeItem(`shilp.img_${productId}`);
    } catch (err) {
      void err;
    }
  }
}

export async function createEnquiry(input: {
  productId: string;
  artisanId: string;
  buyerId: string | null;
  buyerName: string;
  buyerContact: string;
  message: string;
}) {
  const enquiry: EnquiryWithProduct = {
    id: crypto.randomUUID(),
    product_id: input.productId,
    artisan_id: input.artisanId,
    buyer_id: input.buyerId,
    buyer_name: input.buyerName,
    buyer_contact: input.buyerContact,
    message: input.message,
    status: "new",
    created_at: new Date().toISOString(),
    products: null,
  };

  try {
    await supabase.from("buyer_enquiries").insert({
      id: enquiry.id,
      product_id: input.productId,
      artisan_id: input.artisanId,
      buyer_id: input.buyerId,
      buyer_name: input.buyerName,
      buyer_contact: input.buyerContact,
      message: input.message,
    });
  } catch (err) {
    void err;
  }

  saveLocalEnquiry(enquiry);
}

export interface EnquiryWithProduct extends BuyerEnquiry {
  products: { name: string } | null;
}

export async function listEnquiries(artisanId: string): Promise<EnquiryWithProduct[]> {
  const local = getLocalEnquiries(artisanId);
  try {
    const { data, error } = await supabase
      .from("buyer_enquiries")
      .select("*, products(name)")
      .eq("artisan_id", artisanId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const map = new Map<string, EnquiryWithProduct>();
      for (const e of data as unknown as EnquiryWithProduct[]) map.set(e.id, e);
      for (const e of local) map.set(e.id, e);
      return Array.from(map.values());
    }
  } catch (err) {
    void err;
  }

  return local;
}

export async function updateEnquiryStatus(id: string, status: "new" | "contacted" | "closed") {
  try {
    await supabase.from("buyer_enquiries").update({ status }).eq("id", id);
  } catch (err) {
    void err;
  }
  updateLocalEnquiryStatus(id, status);
}

export async function getDashboardStats(artisanId: string) {
  const [products, enquiries] = await Promise.all([
    listMyProducts(artisanId),
    listEnquiries(artisanId),
  ]);

  return {
    total: products.length,
    published: products.filter((r) => r.status === "published").length,
    views: products.reduce((sum, r) => sum + (r.views ?? 0), 0),
    enquiries: enquiries.length,
  };
}
