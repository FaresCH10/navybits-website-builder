import type { Data, ComponentData } from "@puckeditor/core";

export type EditCategory = "color" | "text" | "image" | "link";

export type EditField = {
  nodeIdx: number;
  category: EditCategory;
  subLabel: string;
  styleProp?: string;
  attr?: string;
  isContent?: boolean;
  value: string;
  inputType: "color" | "text" | "url";
};

export type BlockInfo = {
  id: string;
  html: string;
  label: string;
};

const TEXT_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "span", "button", "li",
  "label", "td", "th", "figcaption", "blockquote", "strong", "em",
]);

const SLOT_KEYS = [
  "blocks", "content", "left", "right", "extra",
  "col1", "col2", "col3", "col4",
] as const;

function rgbToHex(color: string): string {
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!m) return color;
  return (
    "#" +
    [m[1], m[2], m[3]]
      .map((x) => parseInt(x).toString(16).padStart(2, "0"))
      .join("")
  );
}

function normalizeColor(color: string): string {
  const c = color.trim();
  if (c.startsWith("rgb")) return rgbToHex(c);
  return c;
}

export function parseHtmlFields(html: string): EditField[] {
  if (typeof window === "undefined" || !html.trim()) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const fields: EditField[] = [];
  let idx = 0;

  function walk(el: Element): void {
    const tag = el.tagName.toLowerCase();
    const nodeIdx = idx++;
    const s = (el as HTMLElement).style;

    if (s.backgroundColor) {
      fields.push({
        nodeIdx, category: "color",
        subLabel: `<${tag}> background`,
        styleProp: "background-color",
        value: normalizeColor(s.backgroundColor),
        inputType: "color",
      });
    } else if (s.background && !s.background.includes("gradient") && !s.background.includes("url(")) {
      fields.push({
        nodeIdx, category: "color",
        subLabel: `<${tag}> background`,
        styleProp: "background",
        value: normalizeColor(s.background.trim()),
        inputType: "color",
      });
    }

    if (s.color) {
      fields.push({
        nodeIdx, category: "color",
        subLabel: `<${tag}> color`,
        styleProp: "color",
        value: normalizeColor(s.color),
        inputType: "color",
      });
    }

    if (TEXT_TAGS.has(tag)) {
      const directText = Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent ?? "")
        .join("")
        .trim();
      if (directText) {
        fields.push({
          nodeIdx, category: "text",
          subLabel: `<${tag}>`,
          isContent: true,
          value: directText,
          inputType: "text",
        });
      }
    }

    if (tag === "img") {
      fields.push({
        nodeIdx, category: "image",
        subLabel: "Image src",
        attr: "src",
        value: el.getAttribute("src") ?? "",
        inputType: "url",
      });
      fields.push({
        nodeIdx, category: "image",
        subLabel: "Alt text",
        attr: "alt",
        value: el.getAttribute("alt") ?? "",
        inputType: "text",
      });
    }

    if (tag === "a") {
      fields.push({
        nodeIdx, category: "link",
        subLabel: "Link URL",
        attr: "href",
        value: el.getAttribute("href") ?? "",
        inputType: "url",
      });
    }

    for (const child of Array.from(el.children)) {
      walk(child);
    }
  }

  for (const child of Array.from(doc.body.children)) {
    walk(child);
  }

  return fields;
}

export function applyFieldToHtml(
  html: string,
  field: EditField,
  newValue: string
): string {
  if (typeof window === "undefined" || !html.trim()) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  let idx = 0;
  let found = false;

  function walk(el: Element): void {
    if (found) return;
    const nodeIdx = idx++;
    if (nodeIdx === field.nodeIdx) {
      found = true;
      if (field.styleProp) {
        (el as HTMLElement).style.setProperty(field.styleProp, newValue);
      } else if (field.attr) {
        el.setAttribute(field.attr, newValue);
      } else if (field.isContent) {
        const textNodes = Array.from(el.childNodes).filter(
          (n) => n.nodeType === Node.TEXT_NODE
        );
        if (textNodes.length > 0) {
          textNodes[0].textContent = newValue;
          for (let i = 1; i < textNodes.length; i++) {
            textNodes[i].textContent = "";
          }
        } else {
          el.insertBefore(doc.createTextNode(newValue), el.firstChild);
        }
      }
      return;
    }
    for (const child of Array.from(el.children)) {
      walk(child);
      if (found) return;
    }
  }

  for (const child of Array.from(doc.body.children)) {
    walk(child);
    if (found) break;
  }

  return doc.body.innerHTML;
}

export function findCustomHtmlBlocks(data: Data): BlockInfo[] {
  const results: BlockInfo[] = [];

  function walk(components: ComponentData[]): void {
    for (const c of components) {
      if (c.type === "CustomHtml") {
        const p = c.props as { id?: string; html?: string; name?: string };
        results.push({
          id: String(p.id ?? ""),
          html: String(p.html ?? ""),
          label: p.name?.trim() || "Custom HTML",
        });
      }
      for (const key of SLOT_KEYS) {
        const val = (c.props as Record<string, unknown>)[key];
        if (Array.isArray(val)) walk(val as ComponentData[]);
      }
    }
  }

  walk(data.content ?? []);
  return results;
}

export function updateBlockHtml(
  data: Data,
  blockId: string,
  newHtml: string
): Data {
  function updateInComponents(components: ComponentData[]): ComponentData[] {
    return components.map((c) => {
      if (c.type === "CustomHtml" && (c.props as { id?: string }).id === blockId) {
        return { ...c, props: { ...c.props, html: newHtml } };
      }
      const updatedProps: Record<string, unknown> = { ...c.props };
      for (const key of SLOT_KEYS) {
        const val = updatedProps[key];
        if (Array.isArray(val)) {
          updatedProps[key] = updateInComponents(val as ComponentData[]);
        }
      }
      return { ...c, props: updatedProps } as ComponentData;
    });
  }

  return { ...data, content: updateInComponents(data.content ?? []) };
}
