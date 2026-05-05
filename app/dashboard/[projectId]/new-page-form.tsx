"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../page.module.css";

export function NewPageForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    let json: { error?: string; page?: { id: string } } = {};
    try {
      json = await res.json();
    } catch {
      json = { error: "Invalid response from server" };
    }
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? `Request failed (${res.status})`);
      return;
    }
    if (!json.page?.id) {
      setError("Server did not return a page id");
      return;
    }
    setName("");
    router.push(`/studio/${projectId}/editor/${json.page.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className={styles.createRow}>
      <input
        className={styles.createInput}
        placeholder="New page name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className={styles.createBtn} type="submit" disabled={busy}>
        {busy ? "…" : "Add page"}
      </button>
      {error && <span className={styles.inlineErr}>{error}</span>}
    </form>
  );
}
