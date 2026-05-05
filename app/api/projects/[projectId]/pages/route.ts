import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";
import { Page } from "@/lib/models/Page";
import { getSessionFromCookies } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";
import { emptyPuckPage } from "@/lib/puck/empty-page";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().max(120).optional(),
});

async function assertProject(projectId: string, userId: string) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) return null;
  await connectDB();
  return Project.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    userId: new mongoose.Types.ObjectId(userId),
  });
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ projectId: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await ctx.params;
  const project = await assertProject(projectId, session.sub);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const pages = await Page.find({ projectId: project._id }).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({
    pages: pages.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      updatedAt: p.updatedAt,
    })),
  });
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ projectId: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await ctx.params;
  const project = await assertProject(projectId, session.sub);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  let slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const clash = await Page.findOne({ projectId: project._id, slug });
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    const page = await Page.create({
      projectId: project._id,
      name: parsed.data.name.trim(),
      slug,
      puckData: emptyPuckPage(parsed.data.name),
    });
    return NextResponse.json({
      page: {
        id: page._id.toString(),
        name: page.name,
        slug: page.slug,
      },
    });
  } catch (e) {
    console.error("Page.create failed", e);
    const msg = e instanceof Error ? e.message : "Could not create page";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
