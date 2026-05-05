import Link from "next/link";

export default function HomePage() {
  return (
    <div className="nb-page">
      <header
        className="nb-container"
        style={{ paddingTop: 28, paddingBottom: 24 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: 3,
                background: "linear-gradient(135deg, #7c6cff, #4ecdc4)",
              }}
            />
            <strong style={{ letterSpacing: "-0.03em" }}>
              NavyBits Website Builder
            </strong>
          </div>
          <nav style={{ display: "flex", gap: 12, fontSize: "0.9rem" }}>
            <Link href="/login" style={{ color: "rgba(255,255,255,0.65)" }}>
              Sign in
            </Link>
            <Link
              href="/register"
              style={{
                padding: "8px 14px",
                borderRadius: 9,
                background: "linear-gradient(135deg, #6e5cff, #9d7bff)",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="nb-container" style={{ paddingBottom: 80 }}>
        <section style={{ paddingTop: 48, maxWidth: 720 }}>
          <p
            style={{
              fontSize: "0.8rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              marginBottom: 16,
            }}
          >
            Website builder · Visual editor · Your projects
          </p>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
              lineHeight: 1.05,
              margin: "0 0 20px",
              letterSpacing: "-0.04em",
            }}
          >
            Welcome to NavyBits Website Builder
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.55)",
              marginBottom: 28,
            }}
          >
            Create and edit web pages in one place: a visual editor for layouts,
            AI help when you want a first draft, and secure accounts with your
            own projects and pages saved in the cloud. Sign up free to start
            building.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/register"
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                background: "#fff",
                color: "#0a0a0f",
                fontWeight: 600,
              }}
            >
              Create free account
            </Link>
            <Link
              href="/login"
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              I already have an account
            </Link>
          </div>
        </section>

        <section
          style={{
            marginTop: 72,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {[
            {
              t: "Visual page builder",
              d: "Arrange sections and content with drag-and-drop — no code required to get started.",
            },
            {
              t: "AI-assisted drafts",
              d: "Describe what you need in plain language and get structured blocks you can refine in the editor.",
            },
            {
              t: "Your workspace",
              d: "Sign in to manage projects and pages, keep work organized, and reuse components across sites.",
            },
          ].map((x) => (
            <div
              key={x.t}
              style={{
                padding: "20px 22px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{x.t}</div>
              <div
                style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}
              >
                {x.d}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
