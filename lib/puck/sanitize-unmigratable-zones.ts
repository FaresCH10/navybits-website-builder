import type { ComponentData, Data } from "@puckeditor/core";
import type { Config } from "@puckeditor/core";
import { puckConfig } from "@/lib/puck-config";

const SLOT_TREE_KEYS = [
  "blocks",
  "content",
  "left",
  "right",
  "extra",
  "col1",
  "col2",
  "col3",
  "col4",
] as const;

function cloneData(d: Data): Data {
  if (typeof structuredClone === "function") {
    return structuredClone(d) as Data;
  }
  return JSON.parse(JSON.stringify(d)) as Data;
}

/**
 * Puck's `migrate()` throws if any `data.zones` key cannot be mapped to a `type: "slot"`
 * field on the parent component (e.g. `root:default-zone`, orphaned legacy keys).
 * Remove those entries so migrate + client render don't crash.
 */
export function sanitizeUnmigratableZones(
  data: Data,
  config: Config = puckConfig
): Data {
  const out = cloneData(data);
  const zones = out.zones;
  if (!zones || typeof zones !== "object") return out;

  const idToType = new Map<string, string>();

  function walk(items: ComponentData[]) {
    for (const item of items) {
      const id = item.props?.id;
      if (typeof id === "string") idToType.set(id, item.type);
      const props = item.props as Record<string, unknown>;
      for (const key of SLOT_TREE_KEYS) {
        const arr = props[key];
        if (!Array.isArray(arr)) continue;
        for (const n of arr) {
          if (n && typeof n === "object" && "type" in n && "props" in n) {
            walk([n as ComponentData]);
          }
        }
      }
    }
  }

  walk((out.content ?? []) as ComponentData[]);

  for (const zc of Object.keys(zones)) {
    const colon = zc.indexOf(":");
    if (colon < 0) continue;
    const parentId = zc.slice(0, colon);
    const slotName = zc.slice(colon + 1);
    if (!slotName) continue;

    const fields =
      parentId === "root"
        ? config.root?.fields
        : (() => {
            const t = idToType.get(parentId);
            if (!t) return undefined;
            return config.components[t]?.fields;
          })();

    const field = fields?.[slotName as keyof typeof fields] as
      | { type?: string }
      | undefined;

    if (!field || field.type !== "slot") {
      delete zones[zc];
    }
  }

  return out;
}
