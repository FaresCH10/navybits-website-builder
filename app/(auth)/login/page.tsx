import { Suspense } from "react";
import { LoginForm } from "./login-form";
import styles from "../auth.module.css";

export default function LoginPage() {
  return (
    <div className={styles.wrap}>
      <Suspense
        fallback={
          <div className={styles.card}>
            <p className={styles.sub}>Loading…</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
