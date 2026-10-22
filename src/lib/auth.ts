/* Server-only session helpers: bcrypt passwords + a JWT kept in an httpOnly
   cookie. Never import from client components (depends on next/headers). */

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "sid";
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

/* Falls back to a fixed dev secret so the app runs with no env at all.
   Set SESSION_SECRET in production (see .env.example). */
function secretKey(): Uint8Array {
  const value = process.env.SESSION_SECRET?.trim();
  return new TextEncoder().encode(value || "skillfit-dev-secret-change-me");
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export async function signSessionToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function readSessionToken(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Cookie attributes shared by every place that sets the session. */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_S,
  // Local demo runs over http; enable when deploying behind https.
  secure: false,
};

/** Current session user id, or null when signed out / token invalid. */
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}
