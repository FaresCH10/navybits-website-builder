import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { SavedComponent } from "@/lib/models/SavedComponent";
import { Project } from "@/lib/models/Project";
import { getSessionFromCookies } from "@/lib/auth/session";
import { AI_BLOCK_TYPES } from "@/lib/ai/normalize-ai-blocks";

const blockTypeSchema = z.string().refine((t): boolean => AI_BLOCK_TYPES.includes(t as never));

const createSchema = z.object({
  name: z.string().min(1).max(120),
  componentType: blockTypeSchema,
  props: z.record(z.string(), z.unknown()),
  projectId: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  await connectDB();
  const q: Record<string, unknown> = { userId: session.sub };
  if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    const owns = await Project.findOne({
      _id: new mongoose.Types.ObjectId(projectId),
      userId: new mongoose.Types.ObjectId(session.sub),
    });
    if (!owns) return NextResponse.json({ error: "Invalid project" }, { status: 400 });
    q.projectId = new mongoose.Types.ObjectId(projectId);
  }
  const items = await SavedComponent.find(q).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({
    items: items.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      componentType: s.componentType,
      props: s.props,
      projectId: s.projectId?.toString(),
      updatedAt: s.updatedAt,
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
  let projectId: mongoose.Types.ObjectId | undefined;
  if (parsed.data.projectId) {
    const p = await Project.findOne({
      _id: new mongoose.Types.ObjectId(parsed.data.projectId),
      userId: new mongoose.Types.ObjectId(session.sub),
    });
    if (!p) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    projectId = p._id;
  }
  const doc = await SavedComponent.create({
    userId: new mongoose.Types.ObjectId(session.sub),
    projectId,
    name: parsed.data.name.trim(),
    componentType: parsed.data.componentType,
    props: parsed.data.props,
  });
  return NextResponse.json({
    item: {
      id: doc._id.toString(),
      name: doc.name,
      componentType: doc.componentType,
      props: doc.props,
    },
  });
}
