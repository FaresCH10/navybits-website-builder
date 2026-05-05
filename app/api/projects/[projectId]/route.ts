import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";
import { SavedComponent } from "@/lib/models/SavedComponent";
import { getSessionFromCookies } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  slug: z.string().min(1).max(80).optional(),
});

async function loadOwnedProject(projectId: string, userId: string) {
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
  const project = await loadOwnedProject(projectId, session.sub);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    project: {
      id: project._id.toString(),
      name: project.name,
      slug: project.slug,
      description: project.description,
      updatedAt: project.updatedAt,
    },
  });
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ projectId: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await ctx.params;
  const project = await loadOwnedProject(projectId, session.sub);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { name, description, slug: rawSlug } = parsed.data;
  if (name !== undefined) project.name = name.trim();
  if (description !== undefined) project.description = description;
  if (rawSlug !== undefined) {
    let slug = slugify(rawSlug);
    const clash = await Project.findOne({
      userId: project.userId,
      slug,
      _id: { $ne: project._id },
    });
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
    project.slug = slug;
  }
  await project.save();
  return NextResponse.json({
    project: {
      id: project._id.toString(),
      name: project.name,
      slug: project.slug,
      description: project.description,
    },
  });
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ projectId: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await ctx.params;
  const project = await loadOwnedProject(projectId, session.sub);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { Page } = await import("@/lib/models/Page");
  await Page.deleteMany({ projectId: project._id });
  await SavedComponent.deleteMany({ projectId: project._id });
  await project.deleteOne();
  return NextResponse.json({ ok: true });
}
