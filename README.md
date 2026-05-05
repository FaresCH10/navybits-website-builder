# NavyBits Studio — AI website builder (Puck + Next.js)

Visual, drag-and-drop page building with **Puck**, **Google Gemini 2.0 Flash** (JSON block generation), and **MongoDB** for users, projects, and pages. Authentication uses **HTTP-only JWT cookies**; the dashboard **React context** exposes the signed-in user to client components.

## Features

- **Puck editor** with categories, root SEO fields, slots (via `renderDropZone`), richtext, array, object, radio/select, number, `inline` blocks, `resolveData` (TopicBanner), `permissions`, **outline** + **blocks** plugins, and iframe preview.
- **Gemini** returns structured JSON that matches your component registry; blocks are normalized and appended to the page.
- **Projects & pages** per user; each project gets a `home` page on create.
- **Public URLs** at `/p/{projectSlug}` and `/p/{projectSlug}/{pageSlug}`.
- **Full-screen studio** at `/studio/{projectId}/editor/{pageId}` (Framer-style dark UI).
- **Saved components** library (CRUD) — save presets with JSON props and insert onto the canvas.

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in:

   - `MONGODB_URI` — e.g. MongoDB Atlas or `mongodb://127.0.0.1:27017/navybits`
   - `AUTH_SECRET` — long random string (16+ characters)
   - `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/apikey)
   - (Optional) `GEMINI_MODEL` — defaults to `gemini-2.5-flash-lite`; try `gemini-2.5-flash` or `gemini-1.5-flash` if you hit quota ([rate limits](https://ai.google.dev/gemini-api/docs/rate-limits))

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000), register, create a project, open a page in the **Studio** editor, describe a section in **Gemini**, then click **Publish** in Puck to persist to MongoDB.

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `npm run dev` | Next.js dev (Turbopack)  |
| `npm run build` | Production build       |
| `npm start`   | Start production server  |

## Architecture (short)

- `lib/puck-config.tsx` — Puck `Config` (all block types + root).
- `lib/ai/*` — Gemini client (default `gemini-2.5-flash-lite`, env `GEMINI_MODEL`), model fallbacks on quota, prompt schema, block normalization.
- `lib/models/*` — Mongoose models (`User`, `Project`, `Page`, `SavedComponent`).
- `lib/auth/*` — JOSE JWT in cookies; Edge-safe verification for middleware.
- `middleware.ts` — protects `/dashboard` and `/studio` (redirect to `/login`).
- `app/p/*` — public `Render` output for published pages.

## Evaluation / deliverables

- **Repo**: this repository.
- **Demo**: run locally or deploy to Vercel/your host; set the same env vars.
- **Docs**: this file + inline API routes.

## Notes

- Next.js 16 may log a deprecation notice about `middleware` vs `proxy`; auth still works. Migrate when you upgrade following the official migration guide.
- Ensure Atlas IP allowlist / network access if using MongoDB Atlas.
