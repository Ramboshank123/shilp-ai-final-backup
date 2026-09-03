import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";
const GEMINI_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash"];

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
});

export type CatalogueResult = z.infer<typeof CatalogueSchema> & { ai_generated: boolean };

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
        "You are a cataloguing assistant for Indian artisans selling handmade crafts.",
        "From the artisan's spoken description, produce a professional, culturally respectful marketplace listing.",
        "Return ONLY JSON with keys: name, category, material, colour, size, craft_type, production_time, description, description_hindi, key_features (array of 3-5 short strings).",
        "category must be one of: Pottery, Textiles, Handloom, Bamboo, Woodwork, Jewellery, Embroidery, Painting, Metal craft, Home Décor, Other.",
        "description: 2-3 clear buyer-friendly sentences in English. description_hindi: the same description in Hindi.",
      ].join(" "),
      `Artisan craft hint: ${data.craftHint ?? "unknown"}\nSpoken language: ${data.language}\nDescription: ${data.transcript}`,
    );

    const parsed = parseJson<unknown>(raw);
    const validated = parsed ? CatalogueSchema.safeParse(parsed) : null;
    if (validated?.success) return { ...validated.data, ai_generated: true };

    // Clearly-labelled offline fallback so the demo always works.
    const snippet = data.transcript.slice(0, 220);
    return {
      name: data.craftHint ? `Handcrafted ${data.craftHint} Product` : "Handcrafted Product",
      category: data.craftHint ?? "Other",
      material: "Handmade natural materials",
      colour: "Natural",
      size: "Standard",
      craft_type: data.craftHint ?? "Handicraft",
      production_time: "3 days",
      description: `${snippet} This piece is made entirely by hand by an Indian artisan, with small natural variations that make every item unique.`,
      description_hindi: "यह उत्पाद भारतीय कारीगर द्वारा पूरी तरह हाथ से बनाया गया है।",
      key_features: [
        "Completely handmade",
        "Locally sourced materials",
        "Supports an artisan family",
      ],
      ai_generated: false,
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
