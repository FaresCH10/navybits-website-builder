import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  await connectDB();
  const user = await User.findById(session.sub).lean();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
  });
}
