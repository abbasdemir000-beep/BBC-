import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PROTECTED_PREFIXES = [
  '/api/submissions',
  '/api/analyze',
  '/api/consultations',
  '/api/exam',
  '/api/withdraw',
  '/api/rewards',
  '/api/chat',
  '/api/notifications',
];

const PUBLIC_PATTERNS = [
  /^\/api\/consultations\/[^/]+$/, // GET single consultation (public ones)
  /^\/api\/submissions\?/,          // GET submissions list (public read)
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard API routes on this list
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Allow GET on public patterns to pass through (individual route handlers add fine-grained checks)
  if (req.method === 'GET' && PUBLIC_PATTERNS.some(r => r.test(pathname + req.nextUrl.search))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('km_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  // Attach user info to headers for route handlers (optional, they re-verify via getSessionFromRequest)
  const headers = new Headers(req.headers);
  headers.set('x-user-id', payload.id);
  headers.set('x-user-role', payload.role);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/api/:path*'],
};
