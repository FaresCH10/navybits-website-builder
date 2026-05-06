import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/session";
import styles from "./studio.module.css";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  return (
    <div className={styles.wrap}>
      {children}
    </div>
  );
}
