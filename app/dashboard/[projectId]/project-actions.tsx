"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./project-actions.module.css";

export function ProjectActions({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteProject() {
    if (
      !window.confirm(
        `Delete "${projectName}" and all of its pages and library presets for this project? This cannot be undone.`
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    let json: { error?: string } = {};
    try {
      json = await res.json();
    } catch {
      json = { error: "Invalid response from server" };
    }
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? `Delete failed (${res.status})`);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.danger}
        disabled={busy}
        onClick={deleteProject}
      >
        {busy ? "Deleting…" : "Delete project permanently"}
      </button>
      {error && <span className={styles.err}>{error}</span>}
    </div>
  );
}
