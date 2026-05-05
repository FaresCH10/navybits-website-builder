import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
};

function tryGetSecret(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) return null;
  return new TextEncoder().encode(secret);
}

function getSecret(): Uint8Array {
  const s = tryGetSecret();
  if (!s) {
    throw new Error(
      "Set AUTH_SECRET in .env.local to a long random string (16+ characters)."
    );
  }
  return s;
}

export async function signSession(
  payload: SessionPayload,
  expiresIn: string = "30d"
): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const secret = tryGetSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const sub = payload.sub;
    const email = payload.email as string | undefined;
    const name = payload.name as string | undefined;
    if (!sub || !email || !name) return null;
    return { sub, email, name };
  } catch {
    return null;
  }
}
