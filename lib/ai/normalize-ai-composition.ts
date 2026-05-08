import type { ComponentData } from "@puckeditor/core";

/** All component types the composition generator may emit. */
const VALID_TYPES = new Set([
  "Section",
  "FlexRow",
  "Grid",
  "Card",
  "Heading",
  "TextBlock",
  "ButtonBlock",
  "ImageBlock",
  "Spacer",
  "Divider",
  "FeatureList",
  "QuoteBlock",
  "CtaGroup",
  "VideoEmbed",
  "Hero",
  "TopicBanner",
  "RichParagraph",
]);

/** Slot prop names each layout component owns. */
const SLOT_MAP: Record<string, string[]> = {
  Section: ["blocks"],
  FlexRow: ["left", "right"],
  Grid: ["col1", "col2", "col3", "col4"],
  Card: ["content"],
  Hero: ["extra"],
};

function normalizeBlock(raw: unknown): ComponentData | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const type = typeof obj.type === "string" ? obj.type : null;
  if (!type || !VALID_TYPES.has(type)) return null;

  const rawProps =
    obj.props && typeof obj.props === "object"
      ? (obj.props as Record<string, unknown>)
      : {};

  const slotKeys = SLOT_MAP[type] ?? [];
  const props: Record<string, unknown> = {};

  // Copy scalar props
  for (const [k, v] of Object.entries(rawProps)) {
    if (slotKeys.includes(k)) continue;
    props[k] = v;
  }

  // Recursively normalize each slot
  for (const slotKey of slotKeys) {
    const raw = rawProps[slotKey];
    if (Array.isArray(raw)) {
      props[slotKey] = raw
        .map((item) => normalizeBlock(item))
        .filter((b): b is ComponentData => b !== null);
    } else {
      props[slotKey] = [];
    }
  }

  return { type, props } as ComponentData;
}

/** Parse and validate Gemini's composition JSON into a clean ComponentData array. */
export function normalizeAiComposition(root: unknown): ComponentData[] {
  if (!root || typeof root !== "object") return [];
  const obj = root as { blocks?: unknown };
  if (!Array.isArray(obj.blocks)) return [];
  return obj.blocks
    .map((item) => normalizeBlock(item))
    .filter((b): b is ComponentData => b !== null);
}
