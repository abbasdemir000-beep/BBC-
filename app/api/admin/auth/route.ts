import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  generateAdminToken,
  isValidAdminToken,
} from '@/lib/admin-auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '07774564334';

// GET — check if admin cookie is valid
export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const ok = !!token && isValidAdminToken(token);
  return NextResponse.json({ ok });
}

// POST — login with password
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    const token = generateAdminToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}

// DELETE — logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
