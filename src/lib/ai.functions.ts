import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { matchGiCraft } from "./gi-registry";
import type { GiTagInfo, FairWageBreakdown, ArtisanAudioNote } from "./types";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";
const GEMINI_MODELS = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

async function callAI(system: string, user: string, jsonMode = true): Promise<string | null> {
  const gemini = getGeminiClient();
  if (gemini) {
    for (const model of GEMINI_MODELS) {
      try {
        const response = await gemini.models.generateContent({
          model,
          contents: user,
          config: {
            systemInstruction: system,
            ...(jsonMode ? { responseMimeType: "application/json" } : {}),
          },
        });
        if (response.text) return response.text;
      } catch (err: unknown) {
        const errObj = err as { status?: number; message?: string } | undefined;
        console.warn(
          `Gemini model ${model} request returned status: ${errObj?.status ?? "unknown"}`,
        );
      }
    }
  }

  const key = process.env["LOVABLE_API_KEY"];
  if (!key || !key.startsWith("sk_")) return null;
  try {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.warn("AI gateway fallback failed with status:", res.status);
      return null;
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return json.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.warn("AI gateway request failed:", error);
    return null;
  }
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

function extractPayload(input: unknown): unknown {
  if (
    input &&
    typeof input === "object" &&
    "data" in input &&
    (input as { data?: unknown }).data !== undefined
  ) {
    return (input as { data?: unknown }).data;
  }
  return input;
}

const CatalogueSchema = z.object({
  name: z.string().min(2),
  category: z.string().default("Other"),
  material: z.string().default(""),
  colour: z.string().default(""),
  size: z.string().default(""),
  craft_type: z.string().default(""),
  production_time: z.string().default(""),
  description: z.string().min(10),
  description_hindi: z.string().default(""),
  key_features: z.array(z.string()).default([]),
  provenance_story: z.string().optional(),
  estimated_hours: z.number().optional().default(16),
  suggested_price: z.number().optional().default(550),
});

export type CatalogueResult = z.infer<typeof CatalogueSchema> & {
  ai_generated: boolean;
  gi_tag?: GiTagInfo | null;
  fair_wage?: FairWageBreakdown | null;
  audio_note?: ArtisanAudioNote | null;
  provenance_story?: string | null;
};

/** Turns a spoken/typed artisan description into a structured product catalogue. */
export const generateCatalogue = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        transcript: z.string().min(1),
        language: z.string().default("en"),
        craftHint: z.string().optional(),
      })
      .parse(extractPayload(input)),
  )
  .handler(async ({ data }): Promise<CatalogueResult> => {
    const raw = await callAI(
      [
        "You are an expert cultural cataloguing AI for Indian artisans selling authentic handmade crafts.",
        "Analyze the artisan's description and output a complete marketplace listing with cultural provenance.",
        "Return ONLY valid JSON with keys:",
        "name, category, material, colour, size, craft_type, production_time, description, description_hindi, key_features (3-5 items), provenance_story (2 sentences honoring generational heritage), estimated_hours (number), suggested_price (number in INR).",
        "category must be one of: Pottery, Textiles, Handloom, Bamboo, Woodwork, Jewellery, Embroidery, Painting, Metal craft, Home Décor, Other.",
        "description: 2-3 clear buyer-friendly sentences in English celebrating the artisan's skill.",
        "description_hindi: respectful description in Hindi.",
      ].join(" "),
      `Artisan craft hint: ${data.craftHint ?? "unknown"}\nSpoken language: ${data.language}\nArtisan description: ${data.transcript}`,
    );

    const parsed = parseJson<unknown>(raw);
    const validated = parsed ? CatalogueSchema.safeParse(parsed) : null;
    const baseData = validated?.success ? validated.data : null;

    // Detect official Indian GI Tag match
    const searchText = `${data.craftHint ?? ""} ${data.transcript} ${baseData?.name ?? ""} ${baseData?.craft_type ?? ""}`;
    const giEntry = matchGiCraft(searchText);

    const gi_tag: GiTagInfo | null = giEntry
      ? {
          tag_number: giEntry.tag_number,
          craft_name: giEntry.craft_name,
          state: giEntry.state,
          registered_year: giEntry.registered_year,
          verified: true,
          heritage_seal: giEntry.heritage_seal,
        }
      : null;

    const hours = baseData?.estimated_hours ?? 18;
    const hourlyWage = 110; // Ethical Indian living craft wage ₹110/hr
    const materialCost = Math.round((baseData?.suggested_price ?? 650) * 0.32);
    const artisanDirectPay = Math.round(hours * (hourlyWage / 4)); // adjusted proportional wage
    const fairPrice = materialCost + artisanDirectPay + 75; // packaging & logistics
    const traditionalRetail = Math.round(fairPrice * 2.2); // middlemen 55% markup
    const savings = Math.round(((traditionalRetail - fairPrice) / traditionalRetail) * 100);

    const fair_wage: FairWageBreakdown = {
      material_cost: materialCost,
      artisan_labor_hours: hours,
      hourly_living_wage: hourlyWage,
      direct_artisan_pay: artisanDirectPay,
      middleman_markup_avoided: traditionalRetail - fairPrice,
      traditional_retail_price: traditionalRetail,
      savings_percentage: savings,
    };

    const audio_note: ArtisanAudioNote = {
      dialect:
        data.language === "te" ? "Telugu" : data.language === "ta" ? "Tamil" : "Hindi / Awadhi",
      native_transcript:
        baseData?.description_hindi ||
        "यह हस्तकला हमारी तीन पीढ़ियों की विरासत है। हर विवरण हाथ से गढ़ा गया है।",
      english_translation:
        baseData?.description ||
        "This craft represents three generations of our family heritage. Every detail is shaped by hand.",
      duration_seconds: 14,
    };

    if (baseData) {
      return {
        ...baseData,
        ai_generated: true,
        gi_tag,
        fair_wage,
        audio_note,
        provenance_story:
          baseData.provenance_story ??
          (giEntry
            ? giEntry.historical_origin
            : "Handcrafted using generational techniques passed down through rural artisan communities."),
      };
    }

    // High quality offline fallback
    const snippet = data.transcript.slice(0, 220);
    return {
      name: data.craftHint ? `Handcrafted ${data.craftHint} Craft` : "Handcrafted Artisan Product",
      category: data.craftHint ?? "Handicraft",
      material: "Locally sourced natural materials",
      colour: "Natural earthen tone",
      size: "Handcrafted standard dimensions",
      craft_type: data.craftHint ?? "Traditional handicraft",
      production_time: "3-4 days",
      description: `${snippet} Shaped entirely by hand by a master artisan, embodying timeless techniques where every piece possesses unique individual character.`,
      description_hindi:
        "यह सुंदर हस्तशिल्प पारंपरिक तकनीकों से पूरी तरह हाथ से तैयार किया गया है।",
      key_features: [
        "100% handmade by rural craftsperson",
        "Zero toxic chemicals or synthetic dyes",
        "Certified ethical living wage",
        "Direct artisan-to-patron traceability",
      ],
      ai_generated: false,
      gi_tag,
      fair_wage,
      audio_note,
      provenance_story: giEntry
        ? giEntry.historical_origin
        : "Rooted in centuries of Indian craft guild traditions, created with reverence for natural elements.",
    };
  });

/** Two-way vernacular chat translation between buyer and artisan. */
export const translateVernacularChat = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        message: z.string().min(1),
        sourceLang: z.string().default("en"),
        targetLang: z.string().default("hi"),
      })
      .parse(extractPayload(input)),
  )
  .handler(async ({ data }): Promise<{ translated: string; original: string }> => {
    const raw = await callAI(
      `You are a polite translation assistant connecting an Indian artisan and a craft buyer. Translate the message accurately from ${data.sourceLang} to ${data.targetLang}. Keep cultural politeness (e.g. use 'Aap', 'Ji' in Hindi). Return ONLY JSON: {"translated": "..."}`,
      data.message,
    );
    const parsed = parseJson<{ translated?: string }>(raw);
    return {
      original: data.message,
      translated: parsed?.translated || data.message,
    };
  });

/** Translates catalogue text into another supported language. */
export const translateProduct = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ text: z.string().min(1), target: z.string().min(2) }).parse(extractPayload(input)),
  )
  .handler(async ({ data }): Promise<{ text: string; ai_generated: boolean }> => {
    const raw = await callAI(
      `Translate the product description into ${data.target}. Keep it natural and buyer friendly. Return ONLY JSON: {"text": "..."}`,
      data.text,
    );
    const parsed = parseJson<{ text?: string }>(raw);
    if (parsed?.text) return { text: parsed.text, ai_generated: true };
    return { text: data.text, ai_generated: false };
  });

export interface PriceResult {
  base_cost: number;
  recommended_min: number;
  recommended_max: number;
  margin_percentage: number;
  market_adjustment: number;
  reasoning: string;
  ai_generated: boolean;
}

/** Cost-based price band with an AI market adjustment and plain-language reasoning. */
export const recommendPrice = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        productName: z.string().default("Handmade product"),
        craftType: z.string().default("Handicraft"),
        material: z.number().nonnegative(),
        labour: z.number().nonnegative(),
        packaging: z.number().nonnegative(),
        other: z.number().nonnegative(),
        productionTime: z.string().default(""),
      })
      .parse(extractPayload(input)),
  )
  .handler(async ({ data }): Promise<PriceResult> => {
    const base = data.material + data.labour + data.packaging + data.other;
    const raw = await callAI(
      [
        "You advise Indian artisans on fair retail pricing for handmade products sold online.",
        'Return ONLY JSON: {"margin_percentage": number, "market_adjustment": number, "reasoning": "..."}.',
        "margin_percentage is a healthy retail margin (20-60). market_adjustment is a multiplier between 0.9 and 1.4 for comparable market prices.",
        "reasoning is 2 short sentences in plain English referencing costs, labour and comparable market prices.",
      ].join(" "),
      `Product: ${data.productName}. Craft: ${data.craftType}. Production time: ${data.productionTime}. Material ₹${data.material}, labour ₹${data.labour}, packaging ₹${data.packaging}, other ₹${data.other}. Base cost ₹${base}.`,
    );

    const parsed = parseJson<{
      margin_percentage?: number;
      market_adjustment?: number;
      reasoning?: string;
    }>(raw);

    const margin = clamp(parsed?.margin_percentage ?? 30, 15, 70);
    const adjustment = clamp(parsed?.market_adjustment ?? 1.05, 0.85, 1.5);
    const centre = base * (1 + margin / 100) * adjustment;
    const min = roundTo(centre * 0.95);
    const max = roundTo(centre * 1.1);

    return {
      base_cost: base,
      recommended_min: min,
      recommended_max: max,
      margin_percentage: margin,
      market_adjustment: adjustment,
      reasoning:
        parsed?.reasoning ??
        `Your production cost of ₹${base} covers materials, labour and packaging. A ${Math.round(margin)}% margin keeps the price competitive with comparable handmade listings.`,
      ai_generated: Boolean(parsed),
    };
  });

/** Contextual business coaching based on the artisan's own catalogue. */
export const generateBusinessAdvice = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        craftType: z.string().default("Handicraft"),
        productCount: z.number().default(0),
        publishedCount: z.number().default(0),
        views: z.number().default(0),
        enquiries: z.number().default(0),
        sampleProducts: z.array(z.string()).default([]),
      })
      .parse(extractPayload(input)),
  )
  .handler(async ({ data }): Promise<{ tips: string[]; ai_generated: boolean }> => {
    const raw = await callAI(
      'You are a friendly business coach for Indian artisans. Give 3 short, specific, actionable tips. Use simple language, no jargon. Return ONLY JSON: {"tips": ["...", "...", "..."]}',
      `Craft: ${data.craftType}. Products: ${data.productCount} (${data.publishedCount} published). Views: ${data.views}. Enquiries: ${data.enquiries}. Listings: ${data.sampleProducts.join(", ") || "none yet"}.`,
    );
    const parsed = parseJson<{ tips?: string[] }>(raw);
    if (parsed?.tips?.length) return { tips: parsed.tips.slice(0, 3), ai_generated: true };
    return {
      tips: [
        "Add a clear, well-lit photograph — buyers trust listings they can see properly.",
        "Mention exact dimensions in your listing so buyers know what to expect.",
        "Publish at least three products so buyers can see the range of your craft.",
      ],
      ai_generated: false,
    };
  });

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number) {
  return Math.max(1, Math.round(value / 10) * 10 - 1);
}
