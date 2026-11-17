import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_HOURS,
  SESSION_REMEMBER_DAYS,
  verifySessionToken,
  type AdminSession,
} from "@/lib/session";
import { db } from "./db";

/* ---------- ASP.NET Core Identity password hashes ----------
 * The AdminUsers table was written by ASP.NET's PasswordHasher, so the same format is used
 * here: existing passwords keep working and the old app can still read new ones.
 *   v3: 0x01 | PRF (uint32 BE) | iterations (uint32 BE) | salt length (uint32 BE) | salt | subkey
 *   v2: 0x00 | salt (16) | subkey (32), PBKDF2-HMAC-SHA1 with 1000 iterations
 */
const PRF = { 0: "sha1", 1: "sha256", 2: "sha512" } as const;

export function verifyAspNetHash(password: string, encoded: string): boolean {
  let bytes: Buffer;
  try {
    bytes = Buffer.from(encoded, "base64");
  } catch {
    return false;
  }
  if (bytes.length === 0) return false;

  if (bytes[0] === 0x00 && bytes.length === 49) {
    const salt = bytes.subarray(1, 17);
    const expected = bytes.subarray(17);
    const actual = pbkdf2Sync(password, salt, 1000, 32, "sha1");
    return timingSafeEqual(actual, expected);
  }

  if (bytes[0] === 0x01 && bytes.length >= 13) {
    const prf = PRF[bytes.readUInt32BE(1) as keyof typeof PRF];
    const iterations = bytes.readUInt32BE(5);
    const saltLength = bytes.readUInt32BE(9);
    if (!prf || saltLength < 16 || iterations < 1 || 13 + saltLength >= bytes.length) return false;
    const salt = bytes.subarray(13, 13 + saltLength);
    const expected = bytes.subarray(13 + saltLength);
    const actual = pbkdf2Sync(password, salt, iterations, expected.length, prf);
    return timingSafeEqual(actual, expected);
  }

  return false;
}

export function createAspNetHash(password: string): string {
  const salt = randomBytes(16);
  const subkey = pbkdf2Sync(password, salt, 100_000, 32, "sha512");
  const header = Buffer.alloc(13);
  header[0] = 0x01;
  header.writeUInt32BE(2, 1); // HMACSHA512
  header.writeUInt32BE(100_000, 5);
  header.writeUInt32BE(salt.length, 9);
  return Buffer.concat([header, salt, subkey]).toString("base64");
}

/* ---------- Admin users ---------- */

interface AdminRow {
  Id: number;
  Username: string;
  PasswordHash: string;
}

export async function findAdminByUsername(username: string) {
  const q = await db();
  const rows = (await q`
    SELECT id AS "Id", username AS "Username", password_hash AS "PasswordHash"
    FROM admin_users WHERE lower(username) = lower(${username}) LIMIT 1
  `) as AdminRow[];
  return rows[0] ?? null;
}

export async function findAdminById(id: number) {
  const q = await db();
  const rows = (await q`
    SELECT id AS "Id", username AS "Username", password_hash AS "PasswordHash"
    FROM admin_users WHERE id = ${id} LIMIT 1
  `) as AdminRow[];
  return rows[0] ?? null;
}

export async function updateAdminPassword(id: number, password: string) {
  const q = await db();
  await q`UPDATE admin_users SET password_hash = ${createAspNetHash(password)} WHERE id = ${id}`;
}

/* ---------- Sessions ---------- */

export async function startSession(session: AdminSession, remember: boolean) {
  const maxAge = remember ? SESSION_REMEMBER_DAYS * 86_400 : SESSION_HOURS * 3_600;
  const token = await createSessionToken(session, maxAge);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getAdmin(): Promise<AdminSession | null> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** For admin pages and server actions: redirects to the login page when signed out. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/* ---------- Brute-force protection (per process) ---------- */

const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60_000;

export function loginBlocked(key: string) {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.until) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordLoginFailure(key: string) {
  const entry = attempts.get(key);
  const now = Date.now();
  if (!entry || now > entry.until) attempts.set(key, { count: 1, until: now + LOCK_MS });
  else entry.count += 1;
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
