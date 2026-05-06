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
      <label htmlFor="new-project-name" className={styles.srOnly}>
        Project name
      </label>
      <input
        id="new-project-name"
        className={styles.createInput}
        placeholder="New project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-describedby={error ? "new-project-error" : undefined}
      />
      <button className={styles.createBtn} type="submit" disabled={busy} aria-busy={busy}>
        {busy ? "Creating…" : "Create"}
      </button>
      {error && (
        <span id="new-project-error" role="alert" className={styles.inlineErr}>
          {error}
        </span>
      )}
    </form>
  );
}
