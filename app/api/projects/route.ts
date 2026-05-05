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
  description: z.string().max(500).optional(),
});

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const projects = await Project.find({ userId: session.sub })
    .sort({ updatedAt: -1 })
    .lean();
  return NextResponse.json({
    projects: projects.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      description: p.description,
      updatedAt: p.updatedAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.sub);
  let slug = slugify(parsed.data.name);
  const exists = await Project.findOne({ userId, slug });
  if (exists) slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;
  const project = await Project.create({
    userId,
    name: parsed.data.name.trim(),
    slug,
    description: parsed.data.description ?? "",
  });
  await Page.create({
    projectId: project._id,
    name: "Home",
    slug: "home",
    puckData: emptyPuckPage(`${parsed.data.name} — Home`),
  });
  return NextResponse.json({
    project: {
      id: project._id.toString(),
      name: project.name,
      slug: project.slug,
      description: project.description,
    },
  });
}
