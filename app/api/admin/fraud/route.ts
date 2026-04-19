import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { checkAdminCookie } from '@/lib/admin-auth';

const PAGE_SIZE = 20;

async function requireAdmin(req: NextRequest) {
  if (checkAdminCookie(req)) return { role: 'admin' };
  const session = await getSessionFromRequest(req);
  if (!session) return null;
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const resolved = searchParams.get('resolved');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const skip = (page - 1) * PAGE_SIZE;

    const where: Record<string, unknown> = {};
    if (resolved === 'true') where.resolved = true;
    if (resolved === 'false') where.resolved = false;

    const [total, flags] = await Promise.all([
      prisma.antiFraudLog.count({ where }),
      prisma.antiFraudLog.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          eventType: true,
          severity: true,
          score: true,
          action: true,
          resolved: true,
          expertId: true,
          userId: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({ flags, total, page, pages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error('[GET /api/admin/fraud]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { flagId, resolved } = body;

    if (!flagId || typeof resolved !== 'boolean')
      return NextResponse.json({ error: 'flagId and resolved (boolean) required' }, { status: 400 });

    const flag = await prisma.antiFraudLog.update({ where: { id: flagId }, data: { resolved } });
    return NextResponse.json({ flag, ok: true });
  } catch (error) {
    console.error('[PATCH /api/admin/fraud]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
