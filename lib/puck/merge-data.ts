import type { ComponentData, Data } from "@puckeditor/core";

export function mergeIntoData(
  base: Partial<Data>,
  newItems: ComponentData[]
): Data {
  const prev = base.content ?? [];
  return {
    ...base,
    root: base.root ?? { props: { title: "Page", description: "" } },
    content: [...prev, ...newItems],
  } as Data;
}
