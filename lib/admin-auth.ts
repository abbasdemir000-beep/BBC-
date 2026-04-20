import { NextRequest } from 'next/server';
import { createHmac } from 'crypto';

const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? '07774564334';
const ADMIN_SECRET = process.env.JWT_SECRET ?? 'fallback-secret';
export const ADMIN_COOKIE = 'km_admin_token';
export const ADMIN_COOKIE_MAX_AGE = 8 * 60 * 60; // 8 hours

export function generateAdminToken(): string {
  const ts = Date.now();
  const hmac = createHmac('sha256', ADMIN_SECRET).update(`admin:${ts}`).digest('hex');
  return `${ts}.${hmac}`;
}

export function verifyAdminToken(token: string): boolean {
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const ts = token.slice(0, dot);
  const hmac = token.slice(dot + 1);
  const age = Date.now() - parseInt(ts);
  if (isNaN(age) || age > ADMIN_COOKIE_MAX_AGE * 1000) return false;
  const expected = createHmac('sha256', ADMIN_SECRET).update(`admin:${ts}`).digest('hex');
  return hmac === expected;
}

export function checkAdminPassword(password: string): boolean {
  return password === ADMIN_PASS;
}

export function checkAdminCookie(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
