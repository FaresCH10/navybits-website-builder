import type { ComponentData } from "@puckeditor/core";
import { randomUUID } from "crypto";

/** All types the library can store (used as a whitelist by the saved-components API). */
export const AI_BLOCK_TYPES = [
  "Heading",
  "RichParagraph",
  "TextBlock",
  "ImageBlock",
  "ButtonBlock",
  "Section",
  "FlexRow",
  "Grid",
  "Card",
  "Hero",
  "Spacer",
  "Divider",
  "FeatureList",
  "CtaGroup",
  "TopicBanner",
  "QuoteBlock",
  "VideoEmbed",
  "CustomHtml",
] as const;

export type AiBlockType = (typeof AI_BLOCK_TYPES)[number];

type RawHtmlBlock = { html: string };

function isRawHtmlBlock(x: unknown): x is RawHtmlBlock {
  return !!x && typeof x === "object" && typeof (x as RawHtmlBlock).html === "string";
}

/** Turn Gemini HTML-blocks JSON into CustomHtml ComponentData items. */
export function normalizeAiBlocks(root: unknown): ComponentData[] {
  if (!root || typeof root !== "object") return [];
  const o = root as { blocks?: unknown; html?: unknown };

  let items: RawHtmlBlock[];

  if (typeof o.html === "string") {
    items = [{ html: o.html }];
  } else if (Array.isArray(o.blocks)) {
    items = o.blocks.filter(isRawHtmlBlock);
  } else {
    return [];
  }

  return items
    .filter((b) => b.html.trim())
    .map((b) => ({
      type: "CustomHtml",
      props: { id: randomUUID(), html: b.html },
    } as ComponentData));
}
