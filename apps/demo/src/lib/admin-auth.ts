import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Auth gate for the /admin contact-message inbox. Deliberately low-tech: one
 * shared password from ADMIN_PASSWORD, an opaque random session token in an
 * httpOnly cookie, tokens tracked in memory. This is a low-stakes personal-use
 * gate, not a real auth system — no JWT/crypto libraries needed.
 */

const SESSION_COOKIE = "instafix_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Singleton — survives Next.js hot reloads in dev, same pattern as memory-store.ts.
const g = globalThis as typeof globalThis & { __instafixAdminSessions?: Set<string> };
if (!g.__instafixAdminSessions) g.__instafixAdminSessions = new Set();
const sessions = g.__instafixAdminSessions;

/** Compares against ADMIN_PASSWORD without a length-revealing timing shortcut. */
export function checkAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  if (candidateBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

export async function createAdminSession(): Promise<void> {
  const token = randomBytes(32).toString("hex");
  sessions.add(token);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function isAdminSessionValid(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token !== undefined && sessions.has(token);
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) sessions.delete(token);
  store.delete(SESSION_COOKIE);
}
