import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { setSessionCookie } from "@/lib/auth/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, password, name } = parsed.data;
    await connectDB();
    const existing = await User.findOne()
      .where("email")
      .equals(email.toLowerCase())
      .exec();
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
    });
    await setSessionCookie({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    });
    return NextResponse.json({
      user: { id: user._id.toString(), email: user.email, name: user.name },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
