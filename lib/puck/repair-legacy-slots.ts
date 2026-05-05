import type { ComponentData, Data } from "@puckeditor/core";

const SLOT_KEYS = ["blocks", "content", "left", "right", "extra", "col1", "col2", "col3", "col4"] as const;

function cloneData(d: Data): Data {
  if (typeof structuredClone === "function") {
    return structuredClone(d) as Data;
  }
  return JSON.parse(JSON.stringify(d)) as Data;
}

/**
 * Section used a slot field named `content`, which collides with Puck's page-level
 * `content` array in some paths — nested blocks never bound to the slot. Migrate
 * legacy `props.content` → `props.blocks` and recurse all slot trees.
 */
function mapItem(item: ComponentData): ComponentData {
  const props = { ...(item.props as Record<string, unknown>) };

  if (item.type === "Section") {
    const legacy = props.content;
    const blocks = props.blocks;
    if (
      Array.isArray(legacy) &&
      legacy.length > 0 &&
      (!Array.isArray(blocks) || blocks.length === 0)
    ) {
      props.blocks = legacy;
      delete props.content;
    } else if (Array.isArray(legacy) && Array.isArray(blocks) && blocks.length > 0) {
      delete props.content;
    }
  }

  for (const key of SLOT_KEYS) {
    const arr = props[key];
    if (!Array.isArray(arr)) continue;
    props[key] = arr.map((node) => {
      if (!node || typeof node !== "object" || !("type" in node)) return node;
      return mapItem(node as ComponentData);
    });
  }

  return { type: item.type, props } as ComponentData;
}

function collectTypes(content: ComponentData[], out: Map<string, string>) {
  for (const item of content) {
    const props = item.props as Record<string, unknown>;
    const id = props.id;
    if (typeof id === "string") out.set(id, item.type);
    for (const key of SLOT_KEYS) {
      const arr = props[key];
      if (!Array.isArray(arr)) continue;
      const children = arr.filter(
        (n): n is ComponentData =>
          !!n && typeof n === "object" && "type" in n && "props" in n
      );
      collectTypes(children, out);
    }
  }
}

export function repairLegacySlots(d: Data): Data {
  const data = cloneData(d);
  data.content = (data.content ?? []).map((item) => mapItem(item));
  const zones = data.zones;
  if (zones && typeof zones === "object") {
    for (const k of Object.keys(zones)) {
      const zone = zones[k];
      if (Array.isArray(zone)) {
        zones[k] = zone.map((item) => mapItem(item as ComponentData));
      }
    }

    const idToType = new Map<string, string>();
    collectTypes(data.content as ComponentData[], idToType);
    for (const zoneItems of Object.values(zones)) {
      if (!Array.isArray(zoneItems)) continue;
      const children = zoneItems.filter(
        (n): n is ComponentData =>
          !!n && typeof n === "object" && "type" in n && "props" in n
      );
      collectTypes(children, idToType);
    }

    for (const key of Object.keys(zones)) {
      const [parentId, slotName] = key.split(":");
      if (!parentId || slotName !== "content") continue;
      if (idToType.get(parentId) !== "Section") continue;
      const nextKey = `${parentId}:blocks`;
      if (!Array.isArray(zones[nextKey]) || zones[nextKey].length === 0) {
        zones[nextKey] = zones[key];
      }
      delete zones[key];
    }
  }
  return data;
}
