import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import type { Data } from "@puckeditor/core";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";
import { Page } from "@/lib/models/Page";
import { getSessionFromCookies } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: z.string().max(120).optional(),
  puckData: z.any().optional(),
});

async function assertPage(projectId: string, pageId: string, userId: string) {
  if (
    !mongoose.Types.ObjectId.isValid(projectId) ||
    !mongoose.Types.ObjectId.isValid(pageId)
  ) {
    return null;
  }
  await connectDB();
  const project = await Project.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    userId: new mongoose.Types.ObjectId(userId),
  });
  if (!project) return null;
  const page = await Page.findOne({
    _id: new mongoose.Types.ObjectId(pageId),
    projectId: project._id,
  });
  if (!page) return null;
  return { project, page };
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ projectId: string; pageId: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, pageId } = await ctx.params;
  const result = await assertPage(projectId, pageId, session.sub);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { project, page } = result;
  return NextResponse.json({
    project: {
      id: project._id.toString(),
      name: project.name,
      slug: project.slug,
    },
    page: {
      id: page._id.toString(),
      name: page.name,
      slug: page.slug,
      puckData: page.puckData,
      updatedAt: page.updatedAt,
    },
  });
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ projectId: string; pageId: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, pageId } = await ctx.params;
  const result = await assertPage(projectId, pageId, session.sub);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { page } = result;
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { name, slug: rawSlug, puckData } = parsed.data;
  if (name !== undefined) page.name = name.trim();
  if (rawSlug !== undefined) {
    let slug = slugify(rawSlug);
    const clash = await Page.findOne({
      projectId: page.projectId,
      slug,
      _id: { $ne: page._id },
    });
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
    page.slug = slug;
  }
  if (puckData !== undefined) {
    page.puckData = puckData as Data;
    page.markModified("puckData");
  }
  await page.save();
  return NextResponse.json({
    page: {
      id: page._id.toString(),
      name: page.name,
      slug: page.slug,
      puckData: page.puckData,
    },
  });
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ projectId: string; pageId: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, pageId } = await ctx.params;
  const result = await assertPage(projectId, pageId, session.sub);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { page } = result;
  const count = await Page.countDocuments({ projectId: page.projectId });
  if (count <= 1) {
    return NextResponse.json(
      { error: "Each project needs at least one page" },
      { status: 400 }
    );
  }
  await page.deleteOne();
  return NextResponse.json({ ok: true });
}
