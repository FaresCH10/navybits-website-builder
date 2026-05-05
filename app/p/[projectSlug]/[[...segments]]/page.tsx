import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Data } from "@puckeditor/core";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";
import { Page } from "@/lib/models/Page";
import { preparePuckPageData } from "@/lib/puck/prepare-page-data";
import { PuckSiteRender } from "@/components/puck/PuckSiteRender";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectSlug: string; segments?: string[] }>;
}): Promise<Metadata> {
  const { projectSlug, segments } = await params;
  await connectDB();
  const project = await Project.findOne({ slug: projectSlug }).lean();
  if (!project) return { title: "Not found" };
  const pageSlug =
    !segments || segments.length === 0 ? "home" : segments.join("/");
  const page = await Page.findOne({
    projectId: project._id,
    slug: pageSlug,
  }).lean();
  if (!page) return { title: project.name };
  const data = preparePuckPageData(page.puckData as Data);
  const title =
    (data.root?.props as { title?: string })?.title ?? page.name;
  const description =
    (data.root?.props as { description?: string })?.description ?? "";
  return {
    title: `${title} · ${project.name}`,
    description,
  };
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ projectSlug: string; segments?: string[] }>;
}) {
  const { projectSlug, segments } = await params;
  await connectDB();
  const project = await Project.findOne({ slug: projectSlug }).lean();
  if (!project) notFound();
  const pageSlug =
    !segments || segments.length === 0 ? "home" : segments.join("/");
  const page = await Page.findOne({
    projectId: project._id,
    slug: pageSlug,
  }).lean();
  if (!page) notFound();

  const data = preparePuckPageData(page.puckData as Data);

  return (
    <main className="nb-public">
      <PuckSiteRender data={data} />
    </main>
  );
}
