// Single-administrator sign-in using ADMIN_USERNAME / ADMIN_PASSWORD and a signed, HTTP-only session cookie.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'mpiitech_admin';
const SESSION_HOURS = 12;

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);
export const adminUsername = () => process.env.ADMIN_USERNAME?.trim() || 'admin';

// Changing ADMIN_PASSWORD (or ADMIN_SESSION_SECRET) signs out every existing session.
const secret = () => `${process.env.ADMIN_SESSION_SECRET ?? ''}:${process.env.ADMIN_PASSWORD ?? ''}`;
const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('base64url');
const digest = (value: string) => createHash('sha256').update(value).digest();
const same = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

export function checkCredentials(username: string, password: string) {
  if (!adminConfigured()) return false;
  const userOk = same(username.trim().toLowerCase(), adminUsername().toLowerCase());
  const passOk = same(password, process.env.ADMIN_PASSWORD ?? '');
  return userOk && passOk;
}

export function createSessionValue(now = Date.now()) {
  const expires = now + SESSION_HOURS * 3600_000;
  return { value: `${expires}.${sign(`admin.${expires}`)}`, expires: new Date(expires) };
}

export function verifySessionValue(value: string | undefined, now = Date.now()) {
  if (!value || !adminConfigured()) return false;
  const [expires, signature] = value.split('.');
  if (!expires || !signature || Number(expires) < now) return false;
  return same(signature, sign(`admin.${expires}`));
}

export async function isAdmin() {
  return verifySessionValue((await cookies()).get(SESSION_COOKIE)?.value);
}

export class UnauthorisedError extends Error { constructor() { super('Your session has expired. Please sign in again.'); } }

export async function requireAdmin() {
  if (!(await isAdmin())) throw new UnauthorisedError();
}

// Best-effort brute-force protection (per server instance).
const attempts = new Map<string, { count: number; reset: number }>();
export function loginRateLimited(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.reset < now) { attempts.set(key, { count: 1, reset: now + 15 * 60_000 }); return false; }
  entry.count++;
  return entry.count > 10;
}
export const clearLoginAttempts = (key: string) => attempts.delete(key);
