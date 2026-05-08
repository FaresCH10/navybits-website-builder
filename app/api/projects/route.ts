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
  const name = parsed.data.name.trim();
  const description = parsed.data.description ?? "";
  const baseSlug = slugify(name);

  let project: mongoose.HydratedDocument<typeof Project.prototype> | null = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug =
      attempt === 0 ? baseSlug : `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      project = await new Project({
        userId,
        name,
        slug,
        description,
      }).save();
      break;
    } catch (error) {
      const isDuplicateKey =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000;
      if (!isDuplicateKey) throw error;
    }
  }

  if (!project) {
    return NextResponse.json(
      { error: "Could not create project right now. Please try again." },
      { status: 409 }
    );
  }
  await Page.create({
    projectId: project._id,
    name: "Home",
    slug: "home",
    puckData: emptyPuckPage(`${name} — Home`),
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
