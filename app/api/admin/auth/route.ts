import { NextRequest, NextResponse } from 'next/server';
import {
  checkAdminPassword,
  checkAdminCookie,
  generateAdminToken,
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
} from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: checkAdminCookie(req) });
}

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try { body = await req.json(); } catch { body = {}; }

  if (!checkAdminPassword(body.password ?? '')) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const token = generateAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
