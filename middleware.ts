import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Routes that require authentication for every method except GET
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

// GETs on these paths are publicly readable; fine-grained auth handled in the route
const PUBLIC_GET_PREFIXES = [
  '/api/consultations',
  '/api/submissions',
  '/api/experts',
  '/api/stats',
  '/api/domain',
  '/api/search',
];

export async function middleware(req: NextRequest) {
  const { pathname, method } = req.nextUrl as unknown as { pathname: string; method: string };
  const reqMethod = req.method;

  // Only intercept configured prefixes
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Allow public GETs through — individual handlers add ownership checks where needed
  if (reqMethod === 'GET' && PUBLIC_GET_PREFIXES.some(p => pathname.startsWith(p))) {
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

  // Forward verified identity so route handlers can trust these headers
  const headers = new Headers(req.headers);
  headers.set('x-user-id', payload.id);
  headers.set('x-user-role', payload.role);
  headers.set('x-user-email', payload.email);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/api/:path*'],
};
