import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";
import { Page } from "@/lib/models/Page";
import { getSessionFromCookies } from "@/lib/auth/session";
import { emptyPuckPage } from "@/lib/puck/empty-page";
import { NewPageForm } from "./new-page-form";
import { ProjectActions } from "./project-actions";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");
  const { projectId } = await params;
  if (!mongoose.Types.ObjectId.isValid(projectId)) notFound();

  await connectDB();
  const project = await Project.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    userId: new mongoose.Types.ObjectId(session.sub),
  }).lean();
  if (!project) notFound();

  let pages = await Page.find({ projectId: project._id })
    .sort({ updatedAt: -1 })
    .lean();

  if (pages.length === 0) {
    try {
      await Page.create({
        projectId: project._id,
        name: "Home",
        slug: "home",
        puckData: emptyPuckPage(`${project.name} — Home`),
      });
    } catch {
      /* race: another request may have created Home */
    }
    pages = await Page.find({ projectId: project._id })
      .sort({ updatedAt: -1 })
      .lean();
  }

  const base = `/studio/${project._id.toString()}/editor`;

  return (
    <div>
      <header className={`${styles.header} ${styles.projectHead}`}>
        <div>
          <h1 className={styles.title}>{project.name}</h1>
          <p className={styles.sub}>
            Public URL prefix{" "}
            <code className={styles.code}>/p/{project.slug}</code>
          </p>
        </div>
      </header>

      <NewPageForm projectId={project._id.toString()} />

      <div className={styles.grid} style={{ marginTop: 24 }}>
        {pages.map((p) => (
          <div key={p._id.toString()} className={styles.card}>
            <div className={styles.cardTitle}>{p.name}</div>
            <div className={styles.cardSlug}>/{p.slug}</div>
            <Link
              href={`${base}/${p._id.toString()}`}
              className={styles.editLink}
            >
              Open in editor →
            </Link>
          </div>
        ))}
      </div>

      <section className={styles.dangerZone} aria-labelledby="delete-project-heading">
        <h2 id="delete-project-heading" className={styles.dangerZoneTitle}>
          Delete project
        </h2>
        <p className={styles.dangerZoneText}>
          Remove <strong>{project.name}</strong>, every page in it, and library
          presets stored for this project. This cannot be undone.
        </p>
        <ProjectActions
          projectId={project._id.toString()}
          projectName={project.name}
        />
      </section>
    </div>
  );
}
