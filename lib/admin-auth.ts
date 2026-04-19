import { createHmac } from 'crypto';
import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '07774564334';
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? 'km-admin-secret-key-2024';
export const ADMIN_COOKIE = 'km_admin';

export function generateAdminToken(): string {
  return createHmac('sha256', ADMIN_SECRET).update(ADMIN_PASSWORD).digest('hex');
}

export function isValidAdminToken(token: string): boolean {
  return token === generateAdminToken();
}

export function checkAdminCookie(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return !!token && isValidAdminToken(token);
}
