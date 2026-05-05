"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Could not register");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create your workspace</h1>
        <p className={styles.sub}>Projects and pages stay private to your account.</p>
        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label}>Name</label>
          <input
            className={styles.input}
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className={styles.label}>Password (8+ chars)</label>
          <input
            className={styles.input}
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.primary} type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className={styles.footer}>
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
