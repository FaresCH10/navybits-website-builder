import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "./constants";
import { verifySession } from "./jwt";

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
