export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_generations: {
        Row: {
          created_at: string;
          generation_type: string;
          id: string;
          input_data: Json | null;
          language: string | null;
          model_name: string | null;
          output_data: Json | null;
          product_id: string | null;
        };
        Insert: {
          created_at?: string;
          generation_type: string;
          id?: string;
          input_data?: Json | null;
          language?: string | null;
          model_name?: string | null;
          output_data?: Json | null;
          product_id?: string | null;
        };
        Update: {
          created_at?: string;
          generation_type?: string;
          id?: string;
          input_data?: Json | null;
          language?: string | null;
          model_name?: string | null;
          output_data?: Json | null;
          product_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_generations_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      artisan_profiles: {
        Row: {
          bio: string | null;
          craft_type: string | null;
          created_at: string;
          id: string;
          languages: string[] | null;
          location: string | null;
          updated_at: string;
          user_id: string;
          years_of_experience: number | null;
        };
        Insert: {
          bio?: string | null;
          craft_type?: string | null;
          created_at?: string;
          id?: string;
          languages?: string[] | null;
          location?: string | null;
          updated_at?: string;
          user_id: string;
          years_of_experience?: number | null;
        };
        Update: {
          bio?: string | null;
          craft_type?: string | null;
          created_at?: string;
          id?: string;
          languages?: string[] | null;
          location?: string | null;
          updated_at?: string;
          user_id?: string;
          years_of_experience?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "artisan_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      buyer_enquiries: {
        Row: {
          artisan_id: string;
          buyer_contact: string;
          buyer_id: string | null;
          buyer_name: string;
          created_at: string;
          id: string;
          message: string;
          product_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          artisan_id: string;
          buyer_contact: string;
          buyer_id?: string | null;
          buyer_name: string;
          created_at?: string;
          id?: string;
          message: string;
          product_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          artisan_id?: string;
          buyer_contact?: string;
          buyer_id?: string | null;
          buyer_name?: string;
          created_at?: string;
          id?: string;
          message?: string;
          product_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "buyer_enquiries_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisan_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "buyer_enquiries_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "buyer_enquiries_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      price_recommendations: {
        Row: {
          base_cost: number | null;
          created_at: string;
          id: string;
          labour_cost: number | null;
          margin_percentage: number | null;
          market_adjustment: number | null;
          material_cost: number | null;
          other_cost: number | null;
          packaging_cost: number | null;
          product_id: string;
          reasoning: string | null;
          recommended_max: number | null;
          recommended_min: number | null;
        };
        Insert: {
          base_cost?: number | null;
          created_at?: string;
          id?: string;
          labour_cost?: number | null;
          margin_percentage?: number | null;
          market_adjustment?: number | null;
          material_cost?: number | null;
          other_cost?: number | null;
          packaging_cost?: number | null;
          product_id: string;
          reasoning?: string | null;
          recommended_max?: number | null;
          recommended_min?: number | null;
        };
        Update: {
          base_cost?: number | null;
          created_at?: string;
          id?: string;
          labour_cost?: number | null;
          margin_percentage?: number | null;
          market_adjustment?: number | null;
          material_cost?: number | null;
          other_cost?: number | null;
          packaging_cost?: number | null;
          product_id?: string;
          reasoning?: string | null;
          recommended_max?: number | null;
          recommended_min?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "price_recommendations_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_details: {
        Row: {
          ai_generated: boolean;
          confidence_score: number | null;
          created_at: string;
          id: string;
          key_features: Json | null;
          product_id: string;
          source_language: string | null;
        };
        Insert: {
          ai_generated?: boolean;
          confidence_score?: number | null;
          created_at?: string;
          id?: string;
          key_features?: Json | null;
          product_id: string;
          source_language?: string | null;
        };
        Update: {
          ai_generated?: boolean;
          confidence_score?: number | null;
          created_at?: string;
          id?: string;
          key_features?: Json | null;
          product_id?: string;
          source_language?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_details_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          created_at: string;
          id: string;
          is_primary: boolean;
          original_image_url: string | null;
          processed_image_url: string | null;
          product_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          original_image_url?: string | null;
          processed_image_url?: string | null;
          product_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          original_image_url?: string | null;
          processed_image_url?: string | null;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          artisan_id: string;
          category_id: string | null;
          colour: string | null;
          craft_type: string | null;
          created_at: string;
          currency: string;
          description: string | null;
          description_hindi: string | null;
          id: string;
          material: string | null;
          name: string;
          price: number | null;
          production_time: string | null;
          size: string | null;
          status: string;
          updated_at: string;
          views: number;
        };
        Insert: {
          artisan_id: string;
          category_id?: string | null;
          colour?: string | null;
          craft_type?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          description_hindi?: string | null;
          id?: string;
          material?: string | null;
          name: string;
          price?: number | null;
          production_time?: string | null;
          size?: string | null;
          status?: string;
          updated_at?: string;
          views?: number;
        };
        Update: {
          artisan_id?: string;
          category_id?: string | null;
          colour?: string | null;
          craft_type?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          description_hindi?: string | null;
          id?: string;
          material?: string | null;
          name?: string;
          price?: number | null;
          production_time?: string | null;
          size?: string | null;
          status?: string;
          updated_at?: string;
          views?: number;
        };
        Relationships: [
          {
            foreignKeyName: "products_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisan_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          preferred_language: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          preferred_language?: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          preferred_language?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_product_views: {
        Args: { _product_id: string };
        Returns: undefined;
      };
      is_published: { Args: { _product_id: string }; Returns: boolean };
      owns_artisan: { Args: { _artisan_id: string }; Returns: boolean };
      owns_product: { Args: { _product_id: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
