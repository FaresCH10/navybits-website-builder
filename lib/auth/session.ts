import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";
import { verifySession, signSession, type SessionPayload } from "./jwt";

const REMEMBER_MAX_AGE_SEC = 60 * 60 * 24 * 30;
const BRIEF_SESSION_JWT = "1d";

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** When `rememberMe` is false, use a session cookie (cleared when the browser closes) and a shorter JWT. */
export async function setSessionCookie(
  payload: SessionPayload,
  options?: { rememberMe?: boolean }
): Promise<void> {
  const rememberMe = options?.rememberMe !== false;
  const token = rememberMe
    ? await signSession(payload, "30d")
    : await signSession(payload, BRIEF_SESSION_JWT);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: REMEMBER_MAX_AGE_SEC } : {}),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
