"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import styles from "../auth.module.css";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Login failed");
      return;
    }
    const next = searchParams.get("next") || "/dashboard";
    router.push(next);
    router.refresh();
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.sub}>Sign in to open your projects.</p>
      <form onSubmit={onSubmit} className={styles.form}>
        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className={styles.label}>Password</label>
        <input
          className={styles.input}
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Keep me signed in on this device</span>
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.primary} type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className={styles.footer}>
        No account? <Link href="/register">Create one</Link>
      </p>
    </div>
  );
}
