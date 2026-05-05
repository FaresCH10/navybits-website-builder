import type { ComponentData, Data } from "@puckeditor/core";

/** Slot prop names we hydrate from `data.zones["{id}:{name}"]` when props arrays are empty. */
const SLOT_KEYS = ["blocks", "content", "left", "right", "extra", "col1", "col2", "col3", "col4"] as const;

function cloneData(d: Data): Data {
  if (typeof structuredClone === "function") {
    return structuredClone(d) as Data;
  }
  return JSON.parse(JSON.stringify(d)) as Data;
}

/**
 * Puck keeps nested slot items in `data.zones` (e.g. `sectionId:blocks`). Client `Render`
 * reads slot children from `props.blocks` / etc. If only `zones` is populated, the Section
 * shell renders but inner blocks do not — copy zone arrays into props when props are empty.
 */
export function mergeZonesIntoSlotProps(data: Data): Data {
  const out = cloneData(data);
  const zones = out.zones ?? {};

  function hydrateItem(item: ComponentData): ComponentData {
    const props = { ...(item.props as Record<string, unknown>) };
    const id = props.id as string | undefined;

    if (id) {
      const prefix = `${id}:`;
      for (const [zoneCompound, raw] of Object.entries(zones)) {
        if (!zoneCompound.startsWith(prefix)) continue;
        let slotName = zoneCompound.slice(prefix.length);
        if (!slotName) continue;
        if (item.type === "Section" && slotName === "content") {
          slotName = "blocks";
        }
        if (!SLOT_KEYS.includes(slotName as (typeof SLOT_KEYS)[number])) continue;
        if (!Array.isArray(raw) || raw.length === 0) continue;
        const existing = props[slotName];
        if (Array.isArray(existing) && existing.length > 0) continue;
        props[slotName] = (raw as ComponentData[]).map((n) => hydrateItem(n));
      }
    }

    for (const key of SLOT_KEYS) {
      const arr = props[key];
      if (!Array.isArray(arr)) continue;
      props[key] = arr.map((node) => {
        if (!node || typeof node !== "object" || !("type" in node)) return node;
        return hydrateItem(node as ComponentData);
      });
    }

    return { type: item.type, props } as ComponentData;
  }

  out.content = (out.content ?? []).map((item) => hydrateItem(item));
  return out;
}
