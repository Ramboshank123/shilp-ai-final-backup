export type LanguageCode = "en" | "hi" | "te" | "ta" | "kn" | "mr";

export type UserRole = "artisan" | "buyer";
export type ProductStatus = "draft" | "published" | "archived" | "sold";
export type EnquiryStatus = "new" | "contacted" | "closed";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  preferred_language: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtisanProfile {
  id: string;
  user_id: string;
  craft_type: string | null;
  location: string | null;
  years_of_experience: number | null;
  bio: string | null;
  languages: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface Product {
  id: string;
  artisan_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  description_hindi: string | null;
  material: string | null;
  colour: string | null;
  size: string | null;
  craft_type: string | null;
  production_time: string | null;
  price: number | null;
  currency: string;
  status: ProductStatus;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  original_image_url: string | null;
  processed_image_url: string | null;
  is_primary: boolean;
}

export interface ProductDetails {
  id: string;
  product_id: string;
  key_features: string[];
  ai_generated: boolean;
  source_language: string | null;
  confidence_score: number | null;
}

export interface PriceRecommendation {
  id?: string;
  product_id?: string;
  material_cost: number;
  labour_cost: number;
  packaging_cost: number;
  other_cost: number;
  base_cost: number;
  recommended_min: number;
  recommended_max: number;
  market_adjustment: number;
  margin_percentage: number;
  reasoning: string;
}

export interface BuyerEnquiry {
  id: string;
  product_id: string;
  artisan_id: string;
  buyer_id: string | null;
  buyer_name: string;
  buyer_contact: string;
  message: string;
  status: EnquiryStatus;
  created_at: string;
}

export interface AIGeneration {
  id: string;
  product_id: string | null;
  generation_type:
    | "image"
    | "speech"
    | "translation"
    | "description"
    | "catalogue"
    | "pricing"
    | "business_advice";
  input_data: unknown;
  output_data: unknown;
  model_name: string | null;
  language: string | null;
  created_at: string;
}

/** Structured catalogue produced by the AI catalogue generator. */
export interface CatalogueDraft {
  name: string;
  category: string;
  material: string;
  colour: string;
  size: string;
  craft_type: string;
  production_time: string;
  description: string;
  description_hindi: string;
  key_features: string[];
  ai_generated: boolean;
}

export interface MarketplaceProduct extends Product {
  image_url: string | null;
  artisan_name: string | null;
  artisan_location: string | null;
  category_name: string | null;
}
