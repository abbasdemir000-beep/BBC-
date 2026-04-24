import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (resets on cold start)
const ipStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/auth/login':          { limit: 10,  windowMs: 60_000 },   // 10/min
  '/api/auth/register':       { limit: 5,   windowMs: 60_000 },   // 5/min
  '/api/auth/reset-password': { limit: 3,   windowMs: 300_000 },  // 3/5min
  '/api/analyze':             { limit: 30,  windowMs: 60_000 },   // 30/min
  '/api/':                    { limit: 120, windowMs: 60_000 },   // 120/min default
};

function getLimit(pathname: string) {
  for (const [path, cfg] of Object.entries(RATE_LIMITS)) {
    if (path !== '/api/' && pathname.startsWith(path)) return cfg;
  }
  return RATE_LIMITS['/api/'];
}

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  const ip = getIP(req);
  const cfg = getLimit(pathname);
  const key = `${ip}:${pathname.split('/').slice(0, 4).join('/')}`;
  const now = Date.now();
  const entry = ipStore.get(key);

  if (!entry || now > entry.resetAt) {
    ipStore.set(key, { count: 1, resetAt: now + cfg.windowMs });
  } else {
    entry.count++;
    if (entry.count > cfg.limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return NextResponse.json(
        { error: 'Too many requests', retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      );
    }
  }

  // Clean up old entries periodically (every ~500 requests)
  if (ipStore.size > 10_000) {
    for (const [k, v] of ipStore) {
      if (now > v.resetAt) ipStore.delete(k);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
