import { jwtVerify, SignJWT } from "jose";

/**
 * Admin session token (HS256 JWT in an httpOnly cookie).
 * Edge-safe: used by the middleware as well as server code.
 */
export const SESSION_COOKIE = "km_admin";
export const SESSION_HOURS = 8;
export const SESSION_REMEMBER_DAYS = 14;

const DEV_FALLBACK_SECRET = "development-only-secret-do-not-use-in-production-0001";

function secretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_SESSION_SECRET must be set to at least 32 characters.");
    }
    return new TextEncoder().encode(DEV_FALLBACK_SECRET);
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSession {
  id: number;
  username: string;
}

export async function createSessionToken(session: AdminSession, maxAgeSeconds: number) {
  return new SignJWT({ username: session.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(session.id))
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || typeof payload.username !== "string") return null;
    return { id, username: payload.username };
  } catch {
    return null;
  }
}
