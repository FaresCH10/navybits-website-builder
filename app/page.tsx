import Link from "next/link";

function EditorMockup() {
  return (
    <div
      style={{ display: "flex", height: 360, fontSize: "11px", overflow: "hidden" }}
      aria-hidden="true"
    >
      {/* Left sidebar */}
      <div
        style={{
          width: 160,
          background: "#0d0d11",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "14px 6px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "9px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 10,
            paddingLeft: 8,
          }}
        >
          Components
        </div>
        {["Hero", "Section", "Text Block", "Image", "Button", "Card", "Grid"].map(
          (name) => (
            <div
              key={name}
              style={{
                padding: "6px 10px",
                borderRadius: 5,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 1,
              }}
            >
              {name}
            </div>
          )
        )}
      </div>

      {/* Canvas */}
      <div
        style={{
          flex: 1,
          background: "#f0f2f5",
          padding: "16px 20px",
          overflow: "hidden",
        }}
      >
        {/* Mock hero block — selected */}
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            padding: "18px 20px",
            marginBottom: 10,
            border: "2px solid #7c6cff",
            boxShadow: "0 0 0 3px rgba(124,108,255,0.15)",
          }}
        >
          <div
            style={{
              height: 13,
              width: "55%",
              background: "#cbd5e1",
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <div
            style={{
              height: 7,
              width: "80%",
              background: "#e2e8f0",
              borderRadius: 3,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              height: 7,
              width: "65%",
              background: "#e2e8f0",
              borderRadius: 3,
              marginBottom: 14,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                height: 26,
                width: 76,
                background: "#7c6cff",
                borderRadius: 6,
              }}
            />
            <div
              style={{
                height: 26,
                width: 76,
                background: "#f1f5f9",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
              }}
            />
          </div>
        </div>

        {/* Mock 3-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 6,
                padding: "12px 14px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  height: 8,
                  width: "75%",
                  background: "#cbd5e1",
                  borderRadius: 3,
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  height: 6,
                  width: "90%",
                  background: "#e2e8f0",
                  borderRadius: 3,
                  marginBottom: 3,
                }}
              />
              <div
                style={{
                  height: 6,
                  width: "60%",
                  background: "#e2e8f0",
                  borderRadius: 3,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          width: 190,
          background: "#0d0d11",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          padding: "14px 8px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "9px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 14,
            paddingLeft: 8,
          }}
        >
          Properties
        </div>
        {[
          { label: "Background" },
          { label: "Padding Y" },
          { label: "Text Color" },
          { label: "Border Radius" },
          { label: "Font Size" },
        ].map((field) => (
          <div key={field.label} style={{ padding: "4px 8px", marginBottom: 10 }}>
            <div
              style={{
                color: "rgba(255,255,255,0.4)",
                marginBottom: 5,
                fontSize: "10px",
              }}
            >
              {field.label}
            </div>
            <div
              style={{
                height: 26,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 5,
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  {
    title: "Visual page builder",
    description:
      "Drag sections, headings, images and buttons into place — no code needed to create a polished layout.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: "AI-assisted drafts",
    description:
      "Describe a section in plain language — Gemini generates structured blocks you can tweak in the editor.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
  },
  {
    title: "Your workspace",
    description:
      "Projects and pages saved to your account in the cloud — organized, accessible, and ready to publish.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="nb-skip-link">
        Skip to content
      </a>

      <div className="nb-page">
        <header className="nb-container" style={{ paddingTop: 28, paddingBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <Link
              href="/"
              aria-label="NavyBits home"
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  background: "linear-gradient(135deg, #7c6cff, #4ecdc4)",
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              <strong style={{ letterSpacing: "-0.03em", fontSize: "0.95rem" }}>
                NavyBits
              </strong>
            </Link>

            <nav
              aria-label="Main navigation"
              style={{ display: "flex", gap: 8, fontSize: "0.9rem", alignItems: "center" }}
            >
              <Link
                href="/login"
                className="nb-btn-nav"
                style={{
                  color: "rgba(255,255,255,0.72)",
                  padding: "8px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="nb-btn-accent"
                style={{
                  padding: "8px 16px",
                  borderRadius: 9,
                  background: "linear-gradient(135deg, #6e5cff, #9d7bff)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Get started
              </Link>
            </nav>
          </div>
        </header>

        <main id="main-content" className="nb-container" style={{ paddingBottom: 96 }}>
          {/* Hero */}
          <section style={{ paddingTop: 80, maxWidth: 660 }}>
            <p
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.50)",
                marginBottom: 20,
                margin: "0 0 20px",
              }}
            >
              Visual editor · AI drafts · Your projects
            </p>
            <h1
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
                lineHeight: 1.08,
                margin: "0 0 20px",
                letterSpacing: "-0.04em",
              }}
            >
              Build pages visually.{" "}
              <span style={{ color: "rgba(255,255,255,0.42)" }}>
                Launch faster with AI.
              </span>
            </h1>
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.68,
                color: "rgba(255,255,255,0.72)",
                margin: "0 0 32px",
                maxWidth: 540,
              }}
            >
              Drag-and-drop sections, generate layouts from plain language, and
              publish pages — all from one workspace. Free to start.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="/register"
                className="nb-btn-primary"
                style={{
                  padding: "13px 22px",
                  borderRadius: 10,
                  background: "#fff",
                  color: "#0a0a0f",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  display: "inline-block",
                }}
              >
                Start for free
              </Link>
              <Link
                href="/login"
                className="nb-btn-outline"
                style={{
                  padding: "13px 22px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.22)",
                  color: "rgba(255,255,255,0.82)",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  display: "inline-block",
                }}
              >
                Sign in
              </Link>
            </div>
          </section>

          {/* Editor preview mockup */}
          <div
            style={{
              marginTop: 64,
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
            }}
            role="img"
            aria-label="Preview of the NavyBits visual editor interface"
          >
            {/* Window chrome */}
            <div
              style={{
                background: "#13131a",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 6 }} aria-hidden="true">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <span
                    key={c}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c,
                      display: "inline-block",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.35)",
                  marginLeft: 6,
                }}
              >
                NavyBits Studio — My landing page
              </span>
            </div>
            <EditorMockup />
          </div>

          {/* Features */}
          <section
            aria-label="Features"
            style={{
              marginTop: 80,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                className="nb-feature-card"
                style={{
                  padding: "24px 28px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <div
                  style={{
                    color: "var(--nb-accent)",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {f.icon}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 8,
                    fontSize: "0.95rem",
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{
                    fontSize: "0.88rem",
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.62)",
                  }}
                >
                  {f.description}
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}
