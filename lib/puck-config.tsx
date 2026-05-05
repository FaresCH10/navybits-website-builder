import type { Config } from "@puckeditor/core";
import type { CSSProperties, FC, ReactNode } from "react";

/** All Puck blocks — categories showcase typography, media, layout, slots, arrays, objects, richtext, resolveData */
export type PuckBlocks = {
  Heading: {
    text: string;
    level: "h1" | "h2" | "h3" | "h4";
    align: "left" | "center" | "right";
    color: string;
  };
  RichParagraph: {
    body: unknown;
  };
  TextBlock: {
    text: string;
    size: "sm" | "md" | "lg";
    tone: "default" | "muted" | "accent";
    color: string;
  };
  ImageBlock: {
    src: string;
    alt: string;
    widthPct: number;
    radius: number;
    fit: "cover" | "contain" | "fill";
  };
  ButtonBlock: {
    label: string;
    href: string;
    variant: "primary" | "secondary" | "ghost" | "outline";
    size: "sm" | "md" | "lg";
    fullWidth: boolean;
    textColor: string;
    bgColor: string;
    borderRadius: number;
  };
  Section: {
    blocks: FC;
    paddingY: number;
    paddingX: number;
    maxWidth: number;
    background: string;
    borderRadius: number;
    textColor: string;
    display: "block" | "flex";
    flexDirection: "row" | "column";
    justifyContent: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
    alignItems: "flex-start" | "center" | "flex-end" | "stretch";
  };
  FlexRow: {
    left: FC;
    right: FC;
    gap: number;
    valign: "start" | "center" | "end" | "stretch";
    justifyContent: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
  };
  Grid: {
    col1: FC;
    col2: FC;
    col3: FC;
    col4: FC;
    columns: 2 | 3 | 4;
    gap: number;
    rowGap: number;
    align: "start" | "center" | "end" | "stretch";
  };
  Card: {
    content: FC;
    title: string;
    elevated: boolean;
  };
  Hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    imageSrc: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
    extra: FC;
  };
  Spacer: { height: number };
  Divider: { thickness: number; color: string; marginY: number };
  FeatureList: {
    items: { title: string; description: string }[];
    columns: "1" | "2" | "3";
  };
  CtaGroup: {
    group: { headline: string; label: string; href: string };
  };
  TopicBanner: {
    topic: string;
    tagline: string;
  };
  QuoteBlock: {
    quote: string;
    attribution: string;
  };
  VideoEmbed: {
    url: string;
    aspectRatio: "16/9" | "4/3" | "1/1";
  };
};

const toneColor: Record<PuckBlocks["TextBlock"]["tone"], string> = {
  default: "inherit",
  muted: "rgba(15,23,42,0.55)",
  accent: "#5b4cdb",
};

export const puckConfig: Config<PuckBlocks> = {
  categories: {
    typography: {
      title: "Typography",
      components: ["Heading", "RichParagraph", "TextBlock", "QuoteBlock"],
      defaultExpanded: true,
    },
    media: {
      title: "Media",
      components: ["ImageBlock", "VideoEmbed"],
    },
    actions: {
      title: "Actions",
      components: ["ButtonBlock", "CtaGroup", "Hero"],
    },
    layout: {
      title: "Layout",
      components: [
        "Section",
        "FlexRow",
        "Grid",
        "Card",
        "Spacer",
        "Divider",
        "FeatureList",
      ],
    },
    advanced: {
      title: "Advanced",
      components: ["TopicBanner"],
    },
  },
  components: {
    Heading: {
      label: "Heading",
      fields: {
        text: { type: "text", label: "Text" },
        level: {
          type: "select",
          label: "Level",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
          ],
        },
        align: {
          type: "radio",
          label: "Align",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        color: { type: "text", label: "Text color (CSS)" },
      },
      defaultProps: {
        text: "New heading",
        level: "h2",
        align: "left",
        color: "",
      },
      render: ({ text, level, align, color }) => {
        const Tag = level as "h1" | "h2" | "h3" | "h4";
        return (
          <Tag
            style={{
              textAlign: align,
              margin: 0,
              fontWeight: 650,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              ...(color ? { color } : {}),
            }}
          >
            {text}
          </Tag>
        );
      },
    },
    RichParagraph: {
      label: "Rich text",
      fields: {
        body: {
          type: "richtext",
          label: "Content",
        },
      },
      defaultProps: {
        body: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Rich text…" }],
            },
          ],
        },
      },
      render: ({ body }) => (
        <div
          className="nb-rich"
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.65,
            color: "rgba(15,23,42,0.88)",
          }}
        >
          {body as ReactNode}
        </div>
      ),
    },
    TextBlock: {
      label: "Text",
      fields: {
        text: {
          type: "textarea",
          label: "Paragraph",
        },
        size: {
          type: "select",
          label: "Size",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        tone: {
          type: "select",
          label: "Tone",
          options: [
            { label: "Default", value: "default" },
            { label: "Muted", value: "muted" },
            { label: "Accent", value: "accent" },
          ],
        },
        color: { type: "text", label: "Text color (CSS, overrides tone)" },
      },
      defaultProps: {
        text: "Supporting copy goes here. Edit this block or ask AI to rewrite it.",
        size: "md",
        tone: "default",
        color: "",
      },
      render: ({ text, size, tone, color }) => {
        const sizes = { sm: "0.9rem", md: "1.05rem", lg: "1.25rem" };
        return (
          <p
            style={{
              margin: 0,
              fontSize: sizes[size],
              lineHeight: 1.65,
              color: color || toneColor[tone],
            }}
          >
            {text}
          </p>
        );
      },
    },
    ImageBlock: {
      label: "Image",
      fields: {
        src: {
          type: "text",
          label: "Image URL",
        },
        alt: { type: "text", label: "Alt text" },
        widthPct: {
          type: "number",
          label: "Width %",
          min: 20,
          max: 100,
        },
        radius: {
          type: "number",
          label: "Radius (px)",
          min: 0,
          max: 48,
        },
        fit: {
          type: "select",
          label: "Object fit",
          options: [
            { label: "Cover", value: "cover" },
            { label: "Contain", value: "contain" },
            { label: "Fill", value: "fill" },
          ],
        },
      },
      defaultProps: {
        src: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80",
        alt: "Abstract gradient",
        widthPct: 100,
        radius: 12,
        fit: "cover",
      },
      render: ({ src, alt, widthPct, radius, fit }) => (
        <div style={{ width: `${widthPct}%`, maxWidth: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            style={{
              width: "100%",
              display: "block",
              borderRadius: radius,
              objectFit: fit,
              maxHeight: 420,
            }}
          />
        </div>
      ),
    },
    ButtonBlock: {
      label: "Button",
      fields: {
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "Link URL" },
        variant: {
          type: "select",
          label: "Style",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Ghost", value: "ghost" },
            { label: "Outline", value: "outline" },
          ],
        },
        size: {
          type: "select",
          label: "Size",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        fullWidth: {
          type: "radio",
          label: "Width",
          options: [
            { label: "Hug", value: false },
            { label: "Full", value: true },
          ],
        },
        bgColor: { type: "text", label: "Background color (CSS)" },
        textColor: { type: "text", label: "Text color (CSS)" },
        borderRadius: {
          type: "number",
          label: "Border radius (px)",
          min: 0,
          max: 48,
        },
      },
      defaultProps: {
        label: "Get started",
        href: "#",
        variant: "primary",
        size: "md",
        fullWidth: false,
        bgColor: "",
        textColor: "",
        borderRadius: 10,
      },
      render: ({ label, href, variant, size, fullWidth, bgColor, textColor, borderRadius }) => {
        const pad = { sm: "8px 14px", md: "10px 18px", lg: "12px 22px" };
        const fontSize = { sm: "0.85rem", md: "0.95rem", lg: "1.05rem" };
        const styles: Record<string, CSSProperties> = {
          primary: {
            background: "linear-gradient(135deg, #6e5cff, #9d7bff)",
            color: "#fff",
            border: "none",
          },
          secondary: {
            background: "rgba(15,23,42,0.06)",
            color: "#0f172a",
            border: "1px solid rgba(15,23,42,0.12)",
          },
          ghost: {
            background: "transparent",
            color: "#5b4cdb",
            border: "none",
          },
          outline: {
            background: "transparent",
            color: "#0f172a",
            border: "1px solid rgba(15,23,42,0.22)",
          },
        };
        return (
          <a
            href={href}
            style={{
              display: fullWidth ? "block" : "inline-block",
              /* Root canvas dropzone is column flex + stretch; without this, hug-width buttons grow to full row width on publish. */
              alignSelf: fullWidth ? "stretch" : "flex-start",
              textAlign: "center",
              textDecoration: "none",
              borderRadius,
              fontWeight: 600,
              fontSize: fontSize[size],
              padding: pad[size],
              ...styles[variant],
              ...(bgColor ? { background: bgColor } : {}),
              ...(textColor ? { color: textColor } : {}),
              width: fullWidth ? "100%" : "auto",
              maxWidth: "100%",
            }}
          >
            {label}
          </a>
        );
      },
    },
    Section: {
      label: "Section",
      fields: {
        blocks: { type: "slot", label: "Blocks" },
        paddingY: {
          type: "number",
          label: "Padding Y",
          min: 0,
          max: 160,
        },
        paddingX: {
          type: "number",
          label: "Padding X",
          min: 0,
          max: 80,
        },
        maxWidth: {
          type: "number",
          label: "Max width (px)",
          min: 320,
          max: 1400,
        },
        background: { type: "text", label: "Background (CSS color)" },
        textColor: { type: "text", label: "Text color (CSS)" },
        borderRadius: {
          type: "number",
          label: "Corner radius",
          min: 0,
          max: 48,
        },
        display: {
          type: "radio",
          label: "Layout",
          options: [
            { label: "Block", value: "block" },
            { label: "Flex", value: "flex" },
          ],
        },
        flexDirection: {
          type: "radio",
          label: "Direction",
          options: [
            { label: "Row", value: "row" },
            { label: "Column", value: "column" },
          ],
        },
        justifyContent: {
          type: "select",
          label: "Justify content",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
            { label: "Space between", value: "space-between" },
            { label: "Space around", value: "space-around" },
            { label: "Space evenly", value: "space-evenly" },
          ],
        },
        alignItems: {
          type: "select",
          label: "Align items",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
            { label: "Stretch", value: "stretch" },
          ],
        },
      },
      defaultProps: {
        paddingY: 48,
        paddingX: 24,
        maxWidth: 1100,
        background: "rgba(15,23,42,0.03)",
        textColor: "",
        borderRadius: 16,
        display: "block",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        blocks: [] as unknown as FC,
      },
      permissions: {
        duplicate: true,
        delete: true,
        drag: true,
        edit: true,
      },
      render: ({
        blocks: Blocks,
        paddingY,
        paddingX,
        maxWidth,
        background,
        textColor,
        borderRadius,
        display,
        flexDirection,
        justifyContent,
        alignItems,
      }) => (
        <section
          style={{
            padding: `${paddingY}px ${paddingX}px`,
            background,
            borderRadius,
            border: "1px solid rgba(15,23,42,0.08)",
            ...(textColor ? { color: textColor } : {}),
          }}
        >
          <div
            style={{
              maxWidth,
              margin: "0 auto",
              width: "100%",
              minWidth: 0,
              ...(display === "flex"
                ? { display: "flex", flexDirection, justifyContent, alignItems, flexWrap: "wrap" }
                : {}),
            }}
          >
            <Blocks />
          </div>
        </section>
      ),
    },
    FlexRow: {
      label: "Two columns",
      fields: {
        left: { type: "slot", label: "Left column" },
        right: { type: "slot", label: "Right column" },
        gap: { type: "number", label: "Gap (px)", min: 0, max: 120 },
        valign: {
          type: "select",
          label: "Align items",
          options: [
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
            { label: "Stretch", value: "stretch" },
          ],
        },
        justifyContent: {
          type: "select",
          label: "Justify content",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
            { label: "Space between", value: "space-between" },
            { label: "Space around", value: "space-around" },
            { label: "Space evenly", value: "space-evenly" },
          ],
        },
      },
      defaultProps: {
        gap: 32,
        valign: "start",
        justifyContent: "flex-start",
        left: [] as unknown as FC,
        right: [] as unknown as FC,
      },
      render: ({ left: Left, right: Right, gap, valign, justifyContent }) => (
        <div
          style={{
            display: "flex",
            gap,
            alignItems: valign,
            justifyContent,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <Left />
          </div>
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <Right />
          </div>
        </div>
      ),
    },
    Grid: {
      label: "Grid",
      fields: {
        columns: {
          type: "radio",
          label: "Columns",
          options: [
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4", value: 4 },
          ],
        },
        gap: { type: "number", label: "Column gap (px)", min: 0, max: 80 },
        rowGap: { type: "number", label: "Row gap (px)", min: 0, max: 80 },
        align: {
          type: "select",
          label: "Align items",
          options: [
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
            { label: "Stretch", value: "stretch" },
          ],
        },
        col1: { type: "slot", label: "Column 1" },
        col2: { type: "slot", label: "Column 2" },
        col3: { type: "slot", label: "Column 3" },
        col4: { type: "slot", label: "Column 4" },
      },
      defaultProps: {
        columns: 3,
        gap: 24,
        rowGap: 24,
        align: "stretch",
        col1: [] as unknown as FC,
        col2: [] as unknown as FC,
        col3: [] as unknown as FC,
        col4: [] as unknown as FC,
      },
      render: ({ col1: Col1, col2: Col2, col3: Col3, col4: Col4, columns, gap, rowGap, align }) => {
        const cols = ([Col1, Col2, Col3, Col4] as FC[]).slice(0, columns);
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              columnGap: gap,
              rowGap,
              alignItems: align,
            }}
          >
            {cols.map((Col, i) => (
              <div key={i} style={{ minWidth: 0 }}>
                <Col />
              </div>
            ))}
          </div>
        );
      },
    },
    Card: {
      label: "Card",
      fields: {
        title: { type: "text", label: "Title" },
        elevated: {
          type: "radio",
          label: "Shadow",
          options: [
            { label: "Flat", value: false },
            { label: "Elevated", value: true },
          ],
        },
        content: { type: "slot", label: "Body" },
      },
      defaultProps: {
        title: "Card title",
        elevated: true,
        content: [] as unknown as FC,
      },
      render: ({ title, elevated, content: Content }) => (
        <div
          style={{
            borderRadius: 14,
            padding: "20px 22px",
            background: "#ffffff",
            border: "1px solid rgba(15,23,42,0.1)",
            boxShadow: elevated
              ? "0 12px 40px rgba(15,23,42,0.08)"
              : "none",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: 12,
              fontSize: "1.05rem",
            }}
          >
            {title}
          </div>
          <Content />
        </div>
      ),
    },
    Hero: {
      label: "Hero",
      fields: {
        eyebrow: { type: "text", label: "Eyebrow" },
        title: { type: "text", label: "Title" },
        subtitle: { type: "textarea", label: "Subtitle" },
        imageSrc: { type: "text", label: "Side image URL" },
        primaryCta: { type: "text", label: "Primary button" },
        primaryHref: { type: "text", label: "Primary URL" },
        secondaryCta: { type: "text", label: "Secondary button" },
        secondaryHref: { type: "text", label: "Secondary URL" },
        extra: { type: "slot", label: "Extra row" },
      },
      defaultProps: {
        eyebrow: "AI Website Builder",
        title: "Ship pages faster",
        subtitle:
          "Describe blocks in plain English and drop them on the canvas — powered by Gemini.",
        imageSrc:
          "https://images.unsplash.com/photo-1634942537034-253176676d40?w=900&q=80",
        primaryCta: "Start building",
        primaryHref: "#",
        secondaryCta: "View demo",
        secondaryHref: "#",
        extra: [] as unknown as FC,
      },
      render: ({
        extra: Extra,
        eyebrow,
        title,
        subtitle,
        imageSrc,
        primaryCta,
        primaryHref,
        secondaryCta,
        secondaryHref,
      }) => (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            alignItems: "center",
          }}
          className="nb-hero"
        >
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(15,23,42,0.45)",
                marginBottom: 12,
              }}
            >
              {eyebrow}
            </div>
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                lineHeight: 1.1,
              }}
            >
              {title}
            </h2>
            <p
              style={{
                margin: "0 0 22px",
                color: "rgba(15,23,42,0.65)",
                lineHeight: 1.55,
              }}
            >
              {subtitle}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href={primaryHref}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #6e5cff, #9d7bff)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {primaryCta}
              </a>
              <a
                href={secondaryHref}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "1px solid rgba(15,23,42,0.2)",
                  color: "#0f172a",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {secondaryCta}
              </a>
            </div>
            <div style={{ marginTop: 20 }}>
              <Extra />
            </div>
          </div>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt=""
              style={{
                width: "100%",
                borderRadius: 16,
                display: "block",
                boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
              }}
            />
          </div>
        </div>
      ),
    },
    Spacer: {
      label: "Spacer",
      inline: true,
      fields: {
        height: { type: "number", label: "Height (px)", min: 4, max: 240 },
      },
      defaultProps: { height: 24 },
      render: ({ height }) => <div style={{ height }} />,
    },
    Divider: {
      label: "Divider",
      inline: true,
      fields: {
        thickness: { type: "number", label: "Thickness", min: 1, max: 8 },
        color: { type: "text", label: "Color" },
        marginY: { type: "number", label: "Margin Y", min: 0, max: 80 },
      },
      defaultProps: {
        thickness: 1,
        color: "rgba(15,23,42,0.12)",
        marginY: 16,
      },
      render: ({ thickness, color, marginY }) => (
        <hr
          style={{
            border: "none",
            borderTop: `${thickness}px solid ${color}`,
            margin: `${marginY}px 0`,
          }}
        />
      ),
    },
    FeatureList: {
      label: "Feature grid",
      fields: {
        items: {
          type: "array",
          label: "Features",
          arrayFields: {
            title: { type: "text", label: "Title" },
            description: { type: "textarea", label: "Description" },
          },
          defaultItemProps: {
            title: "Feature",
            description: "Short supporting description.",
          },
          getItemSummary: (item) => item.title || "Feature",
        },
        columns: {
          type: "radio",
          label: "Columns",
          options: [
            { label: "1", value: "1" },
            { label: "2", value: "2" },
            { label: "3", value: "3" },
          ],
        },
      },
      defaultProps: {
        items: [
          { title: "Visual editing", description: "Drag, drop, and refine in real time." },
          { title: "AI blocks", description: "Describe a section; Gemini drafts the layout." },
          { title: "Your workspace", description: "Projects and pages stay scoped per account." },
        ],
        columns: "3",
      },
      render: ({ items, columns }) => (
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
          className="nb-feature-grid"
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                padding: "18px 20px",
                borderRadius: 12,
                background: "rgba(15,23,42,0.03)",
                border: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{item.title}</div>
              <div style={{ color: "rgba(15,23,42,0.65)", lineHeight: 1.5 }}>
                {item.description}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    CtaGroup: {
      label: "CTA group",
      fields: {
        group: {
          type: "object",
          label: "Call to action",
          objectFields: {
            headline: { type: "text", label: "Headline" },
            label: { type: "text", label: "Button label" },
            href: { type: "text", label: "URL" },
          },
        },
      },
      defaultProps: {
        group: {
          headline: "Ready to launch?",
          label: "Create project",
          href: "#",
        },
      },
      render: ({ group }) => (
        <div
          style={{
            textAlign: "center",
            padding: "28px 20px",
            borderRadius: 16,
            background:
              "linear-gradient(135deg, rgba(110,92,255,0.12), rgba(248,250,252,1))",
            border: "1px solid rgba(124,108,255,0.25)",
          }}
        >
          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: 650,
              marginBottom: 14,
              color: "#0f172a",
            }}
          >
            {group.headline}
          </div>
          <a
            href={group.href}
            style={{
              display: "inline-block",
              padding: "10px 22px",
              borderRadius: 999,
              background: "#fff",
              color: "#0a0a0f",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {group.label}
          </a>
        </div>
      ),
    },
    TopicBanner: {
      label: "Smart banner (resolveData)",
      fields: {
        topic: { type: "text", label: "Topic keyword" },
        tagline: { type: "textarea", label: "Generated tagline (auto)" },
      },
      defaultProps: {
        topic: "design systems",
        tagline: "",
      },
      resolveData: async ({ props }) => {
        await new Promise((r) => setTimeout(r, 250));
        const t = props.topic?.trim() || "your idea";
        return {
          props: {
            ...props,
            tagline: `Everything you need to ship ${t} — faster collaboration, clearer handoff.`,
          },
        };
      },
      render: ({ topic, tagline }) => (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 12,
            background: "rgba(124,108,255,0.15)",
            border: "1px solid rgba(124,108,255,0.35)",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "rgba(15,23,42,0.5)" }}>
            Topic · {topic}
          </div>
          <div style={{ marginTop: 8, fontWeight: 500 }}>{tagline}</div>
        </div>
      ),
    },
    QuoteBlock: {
      label: "Quote",
      fields: {
        quote: { type: "textarea", label: "Quote" },
        attribution: { type: "text", label: "Attribution" },
      },
      defaultProps: {
        quote: "Build in the open, ship with confidence.",
        attribution: "— Product mantra",
      },
      render: ({ quote, attribution }) => (
        <blockquote
          style={{
            margin: 0,
            paddingLeft: 20,
            borderLeft: "3px solid rgba(124,108,255,0.8)",
            fontSize: "1.15rem",
            lineHeight: 1.55,
          }}
        >
          <p style={{ margin: "0 0 10px" }}>{quote}</p>
          <footer style={{ color: "rgba(15,23,42,0.5)", fontSize: "0.9rem" }}>
            {attribution}
          </footer>
        </blockquote>
      ),
    },
    VideoEmbed: {
      label: "Video",
      fields: {
        url: {
          type: "text",
          label: "YouTube or Vimeo URL",
        },
        aspectRatio: {
          type: "select",
          label: "Aspect ratio",
          options: [
            { label: "16:9", value: "16/9" },
            { label: "4:3", value: "4/3" },
            { label: "1:1", value: "1/1" },
          ],
        },
      },
      defaultProps: {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        aspectRatio: "16/9",
      },
      render: ({ url, aspectRatio }) => {
        let embed = url;
        const yt = url.match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
        );
        if (yt) {
          embed = `https://www.youtube.com/embed/${yt[1]}`;
        }
        const vimeo = url.match(/vimeo\.com\/(\d+)/);
        if (vimeo) {
          embed = `https://player.vimeo.com/video/${vimeo[1]}`;
        }
        return (
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio,
              borderRadius: 12,
              overflow: "hidden",
              background: "#e2e8f0",
            }}
          >
            <iframe
              src={embed}
              title="Video"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        );
      },
    },
  },
  root: {
    fields: {
      title: {
        type: "text",
        label: "Page title (SEO)",
      },
      description: {
        type: "textarea",
        label: "Meta description",
      },
    },
    defaultProps: {
      title: "Page",
      description: "",
    },
    render: ({ children, title, description }) => (
      <div
        className="nb-root"
        data-seo-title={title}
        data-seo-description={description}
      >
        {children}
      </div>
    ),
  },
};

export default puckConfig;
