import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { SavedComponent } from "@/lib/models/SavedComponent";
import { getSessionFromCookies } from "@/lib/auth/session";
import { AI_BLOCK_TYPES } from "@/lib/ai/normalize-ai-blocks";

const blockTypeSchema = z.string().refine((t): boolean => AI_BLOCK_TYPES.includes(t as never));

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  componentType: blockTypeSchema.optional(),
  props: z.record(z.string(), z.unknown()).optional(),
});

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await connectDB();
  const doc = await SavedComponent.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(session.sub),
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (parsed.data.name !== undefined) doc.name = parsed.data.name.trim();
  if (parsed.data.componentType !== undefined)
    doc.componentType = parsed.data.componentType;
  if (parsed.data.props !== undefined) doc.props = parsed.data.props;
  await doc.save();
  return NextResponse.json({
    item: {
      id: doc._id.toString(),
      name: doc.name,
      componentType: doc.componentType,
      props: doc.props,
    },
  });
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await connectDB();
  const doc = await SavedComponent.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(session.sub),
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await doc.deleteOne();
  return NextResponse.json({ ok: true });
}
