"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Could not create");
      return;
    }
    setName("");
    router.push(`/dashboard/${json.project.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className={styles.createRow}>
      <input
        className={styles.createInput}
        placeholder="New project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className={styles.createBtn} type="submit" disabled={busy}>
        {busy ? "…" : "Create"}
      </button>
      {error && <span className={styles.inlineErr}>{error}</span>}
    </form>
  );
}
