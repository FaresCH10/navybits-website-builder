import type { ComponentData } from "@puckeditor/core";

const SLOT_KEYS = ["blocks", "content", "left", "right", "extra", "col1", "col2", "col3", "col4"] as const;

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Remove every `props.id` in the tree so presets can be stored without stale IDs. */
export function stripIdsFromProps(props: Record<string, unknown>): Record<string, unknown> {
  const { id: _drop, ...rest } = props;
  const out: Record<string, unknown> = { ...rest };
  for (const key of SLOT_KEYS) {
    const arr = out[key];
    if (!Array.isArray(arr)) continue;
    out[key] = arr.map((node) => {
      if (!node || typeof node !== "object" || !("type" in node)) return node;
      const cd = node as ComponentData;
      const childProps = cd.props as Record<string, unknown>;
      return {
        type: cd.type,
        props: stripIdsFromProps({ ...childProps }),
      };
    });
  }
  return out;
}

/** Assign a new id to this node and every nested slot child (for insert / canvas). */
export function assignFreshIds(block: ComponentData): ComponentData {
  const props = { ...(block.props as Record<string, unknown>), id: newId() };
  for (const key of SLOT_KEYS) {
    const arr = props[key];
    if (!Array.isArray(arr)) continue;
    props[key] = arr.map((node) => {
      if (!node || typeof node !== "object" || !("type" in node)) return node;
      return assignFreshIds(node as ComponentData);
    });
  }
  return { type: block.type, props } as ComponentData;
}
