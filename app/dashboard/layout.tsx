import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/session";
import { LogoutButton } from "@/components/LogoutButton";
import { UserProvider } from "@/components/providers/UserProvider";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  return (
    <UserProvider
      user={{
        id: session.sub,
        name: session.name,
        email: session.email,
      }}
    >
    <div className={styles.shell}>
      <aside className={styles.side}>
        <Link href="/dashboard" className={styles.logo}>
          <span className={styles.logoDot} />
          Studio
        </Link>
        <div className={styles.user}>
          <div className={styles.userName}>{session.name}</div>
          <div className={styles.userEmail}>{session.email}</div>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard">Projects</Link>
        </nav>
        <div className={styles.logout}>
          <LogoutButton />
        </div>
      </aside>
      <div className={styles.main}>{children}</div>
    </div>
    </UserProvider>
  );
}
