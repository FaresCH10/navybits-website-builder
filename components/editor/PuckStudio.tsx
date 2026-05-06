"use client";

import { useCallback, useMemo, useState } from "react";
import type { ComponentData, Data } from "@puckeditor/core";
import { Puck, blocksPlugin, outlinePlugin } from "@puckeditor/core";
import { puckConfig } from "@/lib/puck-config";
import { mergeIntoData } from "@/lib/puck/merge-data";
import { preparePuckPageData } from "@/lib/puck/prepare-page-data";
import { buildInsertedBlock } from "@/lib/puck/build-inserted-block";
import { assignFreshIds, stripIdsFromProps } from "@/lib/puck/block-tree-ids";
import "@puckeditor/core/puck.css";
import styles from "./PuckStudio.module.css";
import { DarkSelect } from "./DarkSelect";

const COMPONENT_TYPE_OPTIONS = [
  { value: "Heading", label: "Heading" },
  { value: "TextBlock", label: "TextBlock" },
  { value: "ButtonBlock", label: "ButtonBlock" },
  { value: "ImageBlock", label: "ImageBlock" },
  { value: "Section", label: "Section" },
  { value: "Hero", label: "Hero" },
  { value: "FeatureList", label: "FeatureList" },
] as const;

type PageInfo = { id: string; name: string; slug: string };
type SavedItem = {
  id: string;
  name: string;
  componentType: string;
  props: Record<string, unknown>;
};

export function PuckStudio({
  projectId,
  pageId,
  initialData,
  pages,
  projectSlug,
  pageSlug,
  previewPath,
}: {
  projectId: string;
  pageId: string;
  initialData: Data;
  pages: PageInfo[];
  projectSlug: string;
  pageSlug: string;
  previewPath: string;
}) {
  const [data, setData] = useState<Data>(initialData);
  /** Puck only reads `data` on first mount; bumping this remounts the editor so Library/AI updates apply. */
  const [puckMountKey, setPuckMountKey] = useState(0);
  const [pageList, setPageList] = useState<PageInfo[]>(pages);
  const [addingPage, setAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLibraryName, setAiLibraryName] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [activeTab, setActiveTab] = useState<"ai" | "library">("ai");
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [savedList, setSavedList] = useState<SavedItem[]>([]);
  const [libLoading, setLibLoading] = useState(false);

  const plugins = useMemo(
    () => [outlinePlugin(), blocksPlugin()],
    []
  );

  const loadLibrary = useCallback(async () => {
    setLibLoading(true);
    try {
      const res = await fetch(
        `/api/saved-components?projectId=${encodeURIComponent(projectId)}`
      );
      const json = await res.json();
      if (res.ok) setSavedList(json.items ?? []);
    } finally {
      setLibLoading(false);
    }
  }, [projectId]);

  const onPublish = useCallback(
    async (next: Data) => {
      setSaveState("saving");
      try {
        const res = await fetch(
          `/api/projects/${projectId}/pages/${pageId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ puckData: preparePuckPageData(next) }),
          }
        );
        if (!res.ok) throw new Error("Save failed");
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("error");
      }
    },
    [projectId, pageId]
  );

  const createPage = useCallback(async () => {
    const name = newPageName.trim();
    if (!name) return;
    setAddBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) return;
      setPageList((prev) => [...prev, { id: json.page.id, name: json.page.name, slug: json.page.slug }]);
      setNewPageName("");
      setAddingPage(false);
      window.location.href = `/studio/${projectId}/editor/${json.page.id}`;
    } finally {
      setAddBusy(false);
    }
  }, [projectId, newPageName]);

  const deletePage = useCallback(async (targetId: string) => {
    if (pageList.length <= 1) return;
    const res = await fetch(`/api/projects/${projectId}/pages/${targetId}`, { method: "DELETE" });
    if (!res.ok) return;
    setPageList((prev) => prev.filter((p) => p.id !== targetId));
    if (targetId === pageId) {
      const remaining = pageList.find((p) => p.id !== targetId);
      if (remaining) window.location.href = `/studio/${projectId}/editor/${remaining.id}`;
    }
  }, [projectId, pageId, pageList]);

  const runAi = async () => {
    const libraryBase = aiLibraryName.trim();
    if (!aiPrompt.trim()) return;
    if (!libraryBase) {
      setAiError("Enter a library name for items saved to the Library.");
      return;
    }
    setAiBusy(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAiError(json.error ?? "Generation failed");
        return;
      }
      const blocks = (json.blocks ?? []) as ComponentData[];
      setData((prev) => preparePuckPageData(mergeIntoData(prev, blocks)));
      setPuckMountKey((k) => k + 1);
      setAiPrompt("");

      const total = blocks.length;
      let librarySaveFailed = false;
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const suffix = total > 1 ? ` (${i + 1}/${total})` : "";
        let name = `${libraryBase}${suffix}`;
        if (name.length > 120) name = `${name.slice(0, 117)}…`;
        const props = stripIdsFromProps(b.props as Record<string, unknown>);
        const saveRes = await fetch("/api/saved-components", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            componentType: b.type,
            props,
            projectId,
          }),
        });
        if (!saveRes.ok) librarySaveFailed = true;
      }
      if (librarySaveFailed) {
        setAiError(
          "Blocks were added to the page, but saving some items to the library failed."
        );
      }
      loadLibrary();
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setAiBusy(false);
    }
  };

  const insertSaved = (item: SavedItem) => {
    const raw = buildInsertedBlock(
      item.componentType,
      (item.props ?? {}) as Record<string, unknown>
    );
    const block = assignFreshIds(raw);
    setData((prev) => preparePuckPageData(mergeIntoData(prev, [block])));
    setPuckMountKey((k) => k + 1);
  };

  const deleteSaved = async (id: string) => {
    const res = await fetch(`/api/saved-components/${id}`, {
      method: "DELETE",
    });
    if (res.ok) loadLibrary();
  };

  const [presetName, setPresetName] = useState("");
  const [presetType, setPresetType] = useState("Heading");
  const [presetJson, setPresetJson] = useState('{"text":"Hello","level":"h2","align":"left"}');

  const savePreset = async () => {
    let props: Record<string, unknown>;
    try {
      props = JSON.parse(presetJson) as Record<string, unknown>;
    } catch {
      setAiError("Props must be valid JSON");
      return;
    }
    const res = await fetch("/api/saved-components", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: presetName.trim(),
        componentType: presetType,
        props,
        projectId,
      }),
    });
    if (res.ok) {
      setPresetName("");
      loadLibrary();
    }
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark} />
          Studio
        </div>
        <div className={styles.pagesHeader}>
          <span className={styles.sidebarSection}>Pages</span>
          <button
            type="button"
            className={styles.addPageBtn}
            onClick={() => { setAddingPage(true); setNewPageName(""); }}
            title="New page"
          >
            +
          </button>
        </div>
        {addingPage && (
          <form
            className={styles.addPageForm}
            onSubmit={(e) => { e.preventDefault(); createPage(); }}
          >
            <input
              autoFocus
              className={styles.addPageInput}
              placeholder="Page name"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
            />
            <div className={styles.addPageActions}>
              <button type="submit" className={styles.addPageConfirm} disabled={addBusy || !newPageName.trim()}>
                {addBusy ? "…" : "Add"}
              </button>
              <button type="button" className={styles.addPageCancel} onClick={() => setAddingPage(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
        <nav className={styles.nav}>
          {pageList.map((p) => (
            <div key={p.id} className={styles.navItem}>
              <a
                href={`/studio/${projectId}/editor/${p.id}`}
                className={p.id === pageId ? styles.navLinkActive : styles.navLink}
              >
                {p.name}
              </a>
              {pageList.length > 1 && (
                <button
                  type="button"
                  className={styles.navDeleteBtn}
                  onClick={() => deletePage(p.id)}
                  title="Delete page"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </nav>
        <a
          href={`/dashboard/${projectId}`}
          className={styles.back}
        >
          ← Project
        </a>
      </aside>

      <div className={styles.main}>
        <header className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <span className={styles.pageSlug}>{pageSlug}</span>
            <span className={styles.previewHint}>
              Use the editor canvas — click Publish in Puck to save to the database
            </span>
          </div>
          <div className={styles.toolbarRight}>
            <a
              href={previewPath}
              target="_blank"
              rel="noreferrer"
              className={styles.ghostBtn}
            >
              Open site ↗
            </a>
            <span className={styles.saveBadge} data-state={saveState}>
                {saveState === "saving"
                ? "Saving…"
                : saveState === "saved"
                  ? "Saved"
                  : saveState === "error"
                    ? "Save error"
                    : "Publish to sync"}
            </span>
          </div>
        </header>

        <div className={`${styles.split} ${!inspectorOpen ? styles.splitClosed : ""}`}>
          <div className={styles.puckHost}>
            <Puck
              key={`puck-${pageId}-${puckMountKey}`}
              config={puckConfig}
              data={data}
              onChange={setData}
              onPublish={onPublish}
              plugins={plugins}
              headerTitle={`${projectSlug} / ${pageSlug}`}
              iframe={{ enabled: true }}
            />
          </div>

          <aside className={`${styles.inspector} ${!inspectorOpen ? styles.inspectorCollapsed : ""}`}>
            <div className={styles.inspectorHeader}>
              <button
                type="button"
                className={styles.inspectorToggle}
                onClick={() => setInspectorOpen((o) => !o)}
                title={inspectorOpen ? "Collapse panel" : "Expand panel"}
              >
                {inspectorOpen ? "›" : "‹"}
              </button>
              {inspectorOpen && (
                <div className={styles.tabs}>
                  <button
                    type="button"
                    className={activeTab === "ai" ? styles.tabOn : styles.tab}
                    onClick={() => setActiveTab("ai")}
                  >
                    Gemini
                  </button>
                  <button
                    type="button"
                    className={activeTab === "library" ? styles.tabOn : styles.tab}
                    onClick={() => {
                      setActiveTab("library");
                      loadLibrary();
                    }}
                  >
                    Library
                  </button>
                </div>
              )}
            </div>

            {inspectorOpen && activeTab === "ai" && (
              <div className={styles.panel}>
                <p className={styles.panelIntro}>
                  Give this batch a Library name, then describe what you want to
                  create. The generated blocks are added to your page and also
                  saved to this project&apos;s Library using that name. If more than
                  one block is created, names are numbered automatically, like{" "}
                  <code style={{ fontSize: "0.8rem", opacity: 0.85 }}>(1/3)</code>
                  .
                </p>
                <label className={styles.fieldLab} htmlFor="gemini-library-name">
                  Library name
                </label>
                <input
                  id="gemini-library-name"
                  className={styles.input}
                  value={aiLibraryName}
                  onChange={(e) => setAiLibraryName(e.target.value)}
                  placeholder="e.g. Landing hero"
                  maxLength={120}
                  required
                  autoComplete="off"
                />
                <textarea
                  className={styles.textarea}
                  placeholder='e.g. "A hero for a SaaS with headline, subcopy, two CTAs, and an image on the right"'
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={6}
                />
                {aiError && <p className={styles.error}>{aiError}</p>}
                <button
                  type="button"
                  className={styles.primaryBtn}
                  disabled={
                    aiBusy ||
                    !aiPrompt.trim() ||
                    !aiLibraryName.trim()
                  }
                  onClick={runAi}
                >
                  {aiBusy ? "Generating…" : "Generate & append"}
                </button>
              </div>
            )}

            {inspectorOpen && activeTab === "library" && (
              <div className={styles.panel}>
                <p className={styles.panelIntro}>
                  Reusable blocks saved from this workspace. Insert adds to the
                  end of the page.
                </p>
                <label className={styles.fieldLab}>Preset name</label>
                <input
                  className={styles.input}
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Primary hero heading"
                />
                <label className={styles.fieldLab} htmlFor="lib-component-type">
                  Component type
                </label>
                <DarkSelect
                  id="lib-component-type"
                  aria-label="Component type"
                  value={presetType}
                  onChange={setPresetType}
                  options={[...COMPONENT_TYPE_OPTIONS]}
                />
                <label className={styles.fieldLab}>Props (JSON, no id)</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={presetJson}
                  onChange={(e) => setPresetJson(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={savePreset}
                >
                  Save to library
                </button>
                {libLoading ? (
                  <p className={styles.muted}>Loading…</p>
                ) : (
                  <ul className={styles.libList}>
                    {savedList.map((s) => (
                      <li key={s.id} className={styles.libItem}>
                        <div>
                          <div className={styles.libName}>{s.name}</div>
                          <div className={styles.libMeta}>{s.componentType}</div>
                        </div>
                        <div className={styles.libActions}>
                          <button
                            type="button"
                            className={styles.smallBtn}
                            onClick={() => insertSaved(s)}
                          >
                            Insert
                          </button>
                          <button
                            type="button"
                            className={styles.dangerBtn}
                            onClick={() => deleteSaved(s.id)}
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </aside>
        </div>

      </div>
    </div>
  );
}
