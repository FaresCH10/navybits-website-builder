import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromCookies } from "@/lib/auth/session";
import { generateGeminiJson } from "@/lib/ai/gemini";
import { PUCK_AI_SYSTEM } from "@/lib/ai/component-schema-prompt";
import { normalizeAiBlocks } from "@/lib/ai/normalize-ai-blocks";

const bodySchema = z.object({
  prompt: z.string().min(3).max(8000),
});

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
  }
  const fullPrompt = `${PUCK_AI_SYSTEM}\n\nUser request:\n${parsed.data.prompt}\n\nReturn JSON: { "blocks": [...] }`;

  try {
    const text = await generateGeminiJson(fullPrompt);
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI returned non-JSON. Try rephrasing your description." },
        { status: 422 }
      );
    }
    const blocks = normalizeAiBlocks(raw);
    return NextResponse.json({ blocks });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Generation failed";
    const quota =
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("Too Many Requests") ||
      msg.includes("RESOURCE_EXHAUSTED");
    if (quota) {
      return NextResponse.json(
        {
          error:
            "Gemini quota or rate limit. In .env.local set GEMINI_MODEL=gemini-2.5-flash-lite or gemini-2.5-flash, confirm the key at https://aistudio.google.com/apikey , enable Generative Language API for the project, or attach billing. Retry after a minute.",
          detail: msg,
        },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
