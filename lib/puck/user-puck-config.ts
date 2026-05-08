import type { Config } from "@puckeditor/core";
import { puckConfig } from "@/lib/puck-config";

export type SavedComponentItem = {
  id: string;
  name: string;
  componentType: string;
  props: Record<string, unknown>;
};

/**
 * Extend the base Puck config with per-user AI-generated component presets.
 *
 * Each saved component becomes a new Puck component type under the
 * "My AI Blocks" category. When dragged from the panel to the canvas,
 * Puck initialises it with the stored props as defaultProps — including
 * any nested slot arrays, so the full composition is restored.
 */
export function buildUserPuckConfig(userComponents: SavedComponentItem[]): Config {
  if (userComponents.length === 0) return puckConfig as unknown as Config;

  const extraComponents: Record<string, unknown> = {};
  const categoryKeys: string[] = [];

  for (const item of userComponents) {
    const baseKey = item.componentType as keyof typeof puckConfig.components;
    const baseDef = puckConfig.components[baseKey];
    if (!baseDef) continue;

    const typeKey = `AIBlock_${item.id}`;

    extraComponents[typeKey] = {
      ...baseDef,
      label: item.name,
      defaultProps: {
        ...(baseDef.defaultProps ?? {}),
        ...item.props,
      },
    };
    categoryKeys.push(typeKey);
  }

  return {
    ...puckConfig,
    categories: {
      myAiBlocks: {
        title: "My AI Blocks",
        components: categoryKeys,
        defaultExpanded: true,
      },
      ...puckConfig.categories,
    },
    components: {
      ...puckConfig.components,
      ...extraComponents,
    },
  } as unknown as Config;
}
