import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE = 'km_token';
const EXPIRES = 7 * 24 * 60 * 60; // 7 days

// Configurable via env — falls back to seed value so existing deploys keep working
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'abbasdemir000@gmail.com';

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'expert' | 'admin';
  expertId?: string;
  appLanguage?: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${EXPIRES}s`)
    .setIssuedAt()
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** True when the session belongs to the platform admin (role OR bootstrap email). */
export function isAdminSession(session: JWTPayload): boolean {
  return session.role === 'admin' || session.email === ADMIN_EMAIL;
}

/**
 * Require a minimum role.  Admins always pass every role check.
 * Role hierarchy: admin > expert > user
 */
export async function requireRole(
  req: NextRequest,
  role: 'admin' | 'expert' | 'user'
): Promise<JWTPayload | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;

  // Admin passes any check
  if (isAdminSession(payload)) return payload;

  if (role === 'admin') return null; // non-admin tried to reach admin-only route

  if (role === 'expert' && payload.role !== 'expert') return null;

  return payload;
}

export function cookieOptions(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: EXPIRES,
    path: '/',
  };
}

export function clearCookie() {
  return { name: COOKIE, value: '', maxAge: 0, path: '/' };
}
