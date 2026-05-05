import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";
import { getSessionFromCookies } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CreateProjectForm } from "./project-form";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");
  await connectDB();
  const projects = await Project.find({ userId: session.sub })
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.sub}>
            Each project holds its own pages. Open one to edit in the visual
            builder.
          </p>
        </div>
      </header>

      <CreateProjectForm />

      <div className={styles.grid}>
        {projects.length === 0 && (
          <p className={styles.empty}>
            No projects yet — create your first one above.
          </p>
        )}
        {projects.map((p) => (
          <Link
            key={p._id.toString()}
            href={`/dashboard/${p._id.toString()}`}
            className={styles.card}
          >
            <div className={styles.cardTitle}>{p.name}</div>
            <div className={styles.cardSlug}>/{p.slug}</div>
            {p.description ? (
              <div className={styles.cardDesc}>{p.description}</div>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
