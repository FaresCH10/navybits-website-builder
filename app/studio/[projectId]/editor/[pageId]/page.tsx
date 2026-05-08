import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import type { Data } from "@puckeditor/core";
import { connectDB } from "@/lib/mongodb";
import { preparePuckPageData } from "@/lib/puck/prepare-page-data";
import { Project } from "@/lib/models/Project";
import { Page } from "@/lib/models/Page";
import { SavedComponent } from "@/lib/models/SavedComponent";
import { getSessionFromCookies } from "@/lib/auth/session";
import { PuckStudio } from "@/components/editor/PuckStudio";

export const dynamic = "force-dynamic";

export default async function StudioEditorPage({
  params,
}: {
  params: Promise<{ projectId: string; pageId: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");
  const { projectId, pageId } = await params;
  if (
    !mongoose.Types.ObjectId.isValid(projectId) ||
    !mongoose.Types.ObjectId.isValid(pageId)
  ) {
    notFound();
  }
  await connectDB();
  const project = await Project.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    userId: new mongoose.Types.ObjectId(session.sub),
  }).lean();
  if (!project) notFound();
  const page = await Page.findOne({
    _id: new mongoose.Types.ObjectId(pageId),
    projectId: project._id,
  }).lean();
  if (!page) notFound();

  const pages = await Page.find({ projectId: project._id })
    .sort({ updatedAt: -1 })
    .lean();

  const savedComponents = await SavedComponent.find({
    userId: new mongoose.Types.ObjectId(session.sub),
    projectId: project._id,
  })
    .sort({ updatedAt: -1 })
    .lean();

  const initialData = preparePuckPageData(page.puckData as Data);
  const previewPath =
    page.slug === "home"
      ? `/p/${project.slug}`
      : `/p/${project.slug}/${page.slug}`;

  return (
    <PuckStudio
      key={pageId}
      projectId={project._id.toString()}
      pageId={page._id.toString()}
      initialData={initialData}
      pages={pages.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
      }))}
      projectSlug={project.slug}
      pageSlug={page.slug}
      previewPath={previewPath}
      initialSavedList={savedComponents.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        componentType: s.componentType,
        props: s.props as Record<string, unknown>,
      }))}
    />
  );
}
