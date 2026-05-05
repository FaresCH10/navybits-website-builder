import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Prefer small Flash-Lite first (typical free-tier surface in AI Studio).
 * Override with GEMINI_MODEL in .env.local if needed.
 */
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

/** Tried in order after GEMINI_MODEL / DEFAULT_MODEL (deduped). */
const FALLBACK_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash",
] as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parses "Please retry in 27.808s" from Google error messages */
function parseRetryDelayMs(message: string): number | null {
  const m = message.match(/retry in ([\d.]+)\s*s/i);
  if (!m) return null;
  const sec = parseFloat(m[1]);
  if (Number.isNaN(sec)) return null;
  return Math.min(Math.ceil(sec * 1000) + 500, 120_000);
}

function modelChain(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  return Array.from(new Set([primary, ...FALLBACK_MODELS]));
}

function isRateLimited(message: string): boolean {
  return (
    message.includes("429") ||
    message.includes("Too Many Requests") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("quota")
  );
}

/**
 * Generate JSON text from Gemini; cycles models on quota errors and waits once on 429 when the API suggests a delay.
 */
export async function generateGeminiJson(fullPrompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
  }

  const chain = modelChain();
  let lastError: Error = new Error("Gemini request failed");

  for (const modelId of chain) {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        temperature: 0.45,
        responseMimeType: "application/json",
      },
    });

    const attempt = () => model.generateContent([fullPrompt]);

    try {
      const result = await attempt();
      return result.response.text();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      const msg = lastError.message;

      if (isRateLimited(msg)) {
        const waitMs = parseRetryDelayMs(msg);
        if (waitMs !== null) {
          await sleep(waitMs);
          try {
            const result = await attempt();
            return result.response.text();
          } catch (e2) {
            lastError =
              e2 instanceof Error ? e2 : new Error(String(e2));
          }
        }
      }
    }
  }

  throw lastError;
}

/** @deprecated Prefer generateGeminiJson */
export function getGeminiModel(
  modelId = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL
) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
  }
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({
    model: modelId,
    generationConfig: {
      temperature: 0.45,
      responseMimeType: "application/json",
    },
  });
}
