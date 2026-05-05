import type { ComponentData } from "@puckeditor/core";
import { puckConfig } from "@/lib/puck-config";

const componentsMap = puckConfig.components as Record<
  string,
  { defaultProps?: Record<string, unknown> }
>;

/** Build a valid root content item: new id, saved props over defaultProps for that type. */
export function buildInsertedBlock(
  componentType: string,
  savedProps: Record<string, unknown>
): ComponentData {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `id-${Date.now()}`;

  const { id: _old, ...rest } = savedProps;
  const defaults = componentsMap[componentType]?.defaultProps ?? {};
  const props: Record<string, unknown> = { ...defaults, ...rest, id };
  return { type: componentType, props } as ComponentData;
}
