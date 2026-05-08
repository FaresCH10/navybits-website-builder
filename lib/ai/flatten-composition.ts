import type { ComponentData } from "@puckeditor/core";
import { stripIdsFromProps } from "@/lib/puck/block-tree-ids";

/** Component types that are too generic to be worth saving as individual presets. */
const SKIP_TYPES = new Set(["Spacer", "Divider"]);

const SLOT_KEYS = [
  "blocks",
  "left",
  "right",
  "content",
  "col1",
  "col2",
  "col3",
  "col4",
  "extra",
] as const;

export type FlatNode = {
  type: string;
  /** Full props tree with IDs stripped — ready to store in DB. */
  props: Record<string, unknown>;
  name: string;
};

function walkTree(
  block: ComponentData,
  baseName: string,
  typeCounts: Map<string, number>,
  isRoot: boolean
): FlatNode[] {
  if (SKIP_TYPES.has(block.type)) return [];

  const results: FlatNode[] = [];
  const props = block.props as Record<string, unknown>;

  // The root keeps the library name as-is; children get "<base>: <Type>" names
  let nodeName: string;
  if (isRoot) {
    nodeName = baseName;
  } else {
    const count = (typeCounts.get(block.type) ?? 0) + 1;
    typeCounts.set(block.type, count);
    nodeName =
      count === 1
        ? `${baseName}: ${block.type}`
        : `${baseName}: ${block.type} (${count})`;
  }

  // Save this node — stripIdsFromProps recursively removes IDs but keeps slot arrays intact,
  // so re-inserting from the panel will rebuild the full sub-tree with fresh IDs.
  results.push({ type: block.type, props: stripIdsFromProps(props), name: nodeName });

  // Recurse into slot children
  for (const key of SLOT_KEYS) {
    const children = props[key];
    if (!Array.isArray(children)) continue;
    for (const child of children) {
      if (!child || typeof child !== "object" || !("type" in child)) continue;
      results.push(...walkTree(child as ComponentData, baseName, typeCounts, false));
    }
  }

  return results;
}

/**
 * Flatten a composition block tree into individual saveable nodes.
 * The root node is saved with the full nested tree in its props so that
 * inserting it from the Puck panel re-creates the complete composition.
 * Each child is also saved independently so the user can insert sub-components.
 */
export function flattenComposition(root: ComponentData, baseName: string): FlatNode[] {
  return walkTree(root, baseName, new Map(), true);
}
