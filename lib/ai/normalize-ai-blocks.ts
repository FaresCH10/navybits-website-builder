import type { ComponentData } from "@puckeditor/core";
import { randomUUID } from "crypto";

export const AI_BLOCK_TYPES = [
  "Heading",
  "RichParagraph",
  "TextBlock",
  "ImageBlock",
  "ButtonBlock",
  "Section",
  "FlexRow",
  "Card",
  "Hero",
  "Spacer",
  "Divider",
  "FeatureList",
  "CtaGroup",
  "TopicBanner",
  "QuoteBlock",
  "VideoEmbed",
] as const;

export type AiBlockType = (typeof AI_BLOCK_TYPES)[number];

const set = new Set<string>(AI_BLOCK_TYPES);

type RawBlock = {
  type: string;
  props?: Record<string, unknown>;
};

function isRawBlock(x: unknown): x is RawBlock {
  if (!x || typeof x !== "object") return false;
  const b = x as RawBlock;
  return typeof b.type === "string";
}

function nest(
  key: "blocks" | "content" | "left" | "right" | "extra",
  props: Record<string, unknown>
) {
  const v = props[key];
  if (!Array.isArray(v)) return;
  const out: ComponentData[] = [];
  for (const child of v) {
    const n = walkBlock(child);
    if (n) out.push(n);
  }
  (props as Record<string, unknown>)[key] = out;
}

function walkBlock(input: unknown): ComponentData | null {
  if (!isRawBlock(input)) return null;
  if (!set.has(input.type)) return null;
  const props = {
    ...(typeof input.props === "object" && input.props ? input.props : {}),
  } as Record<string, unknown>;

  nest("blocks", props);
  nest("content", props);
  nest("left", props);
  nest("right", props);
  nest("extra", props);

  return {
    type: input.type,
    props: { ...props, id: randomUUID() },
  } as ComponentData;
}

/** Turn Gemini JSON into Puck content items (root array or nested) */
export function normalizeAiBlocks(root: unknown): ComponentData[] {
  if (!root || typeof root !== "object") return [];
  const o = root as { blocks?: unknown };
  if (!Array.isArray(o.blocks)) return [];
  const out: ComponentData[] = [];
  for (const b of o.blocks) {
    const n = walkBlock(b);
    if (n) out.push(n);
  }
  return out;
}

