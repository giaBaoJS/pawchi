import type {
  BreedDetectionResult,
  PersonalityGenerationResult,
} from "@features/scan/types/ai-types";
import { AIParseError, DogNotFoundError } from "@features/scan/types/ai-types";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const OPENAI_KEY_STORAGE = "openai_api_key";
const OPENAI_BASE = "https://api.openai.com/v1";

async function getApiKey(): Promise<string> {
  // Prefer secure store; fall back to expo-constants for local dev
  const stored = await SecureStore.getItemAsync(OPENAI_KEY_STORAGE);
  if (stored) return stored;

  const devKey = (
    Constants.expoConfig?.extra as Record<string, string> | undefined
  )?.openaiApiKey;
  if (devKey) return devKey;

  throw new Error("OpenAI API key not configured");
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 2,
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429) {
        throw new Error("RATE_LIMITED");
      }
      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError ?? new Error("Request failed");
}

function parseJSON<T>(text: string): T {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AIParseError(
      `Could not parse AI response: ${text.slice(0, 100)}`,
    );
  }
}

export async function detectBreed(
  base64Image: string,
): Promise<BreedDetectionResult> {
  const apiKey = await getApiKey();

  const res = await fetchWithRetry(`${OPENAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "low",
              },
            },
            {
              type: "text",
              text: `Analyze this image and return ONLY valid JSON (no markdown) with this exact shape:
{
  "has_dog": boolean,
  "breed": string,
  "confidence": number (0-1),
  "body_size": "small" | "medium" | "large",
  "coat_color": string (e.g. "golden", "black and white"),
  "coat_pattern": string,
  "temperament_keywords": string[]
}
If no dog is visible, set has_dog to false and leave other fields as empty defaults.`,
            },
          ],
        },
      ],
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `OpenAI error ${res.status}: ${JSON.stringify(body).slice(0, 100)}`,
    );
  }

  const data = await res.json();
  console.log(data);
  const content: string = data.choices?.[0]?.message?.content ?? "";
  const result = parseJSON<BreedDetectionResult>(content);
  console.log(result);
  if (!result.has_dog) throw new DogNotFoundError();
  return result;
}

export async function generatePersonality(
  breed: string,
  temperamentKeywords: string[],
): Promise<PersonalityGenerationResult> {
  const apiKey = await getApiKey();

  const res = await fetchWithRetry(`${OPENAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Create a fun character for a virtual dog game based on this real dog:
Breed: ${breed}
Temperament: ${temperamentKeywords.join(", ")}

Return ONLY valid JSON (no markdown) with this exact shape:
{
  "name": string (cute dog name, e.g. "Mochi"),
  "title": string (funny title, e.g. "Supreme Nap Commander"),
  "personality_type": one of: "tsundere" | "hype_man" | "gentle_giant" | "drama_queen" | "zen_master" | "gremlin",
  "catchphrase": string (short, in character, max 60 chars),
  "stats": {
    "energy": number (0-100),
    "affection": number (0-100),
    "mischief": number (0-100),
    "appetite": number (0-100)
  }
}`,
        },
      ],
      max_tokens: 250,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `OpenAI error ${res.status}: ${JSON.stringify(body).slice(0, 100)}`,
    );
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  return parseJSON<PersonalityGenerationResult>(content);
}
