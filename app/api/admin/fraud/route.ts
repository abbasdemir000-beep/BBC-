import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

async function requireAuth(req: NextRequest) {
  const s = await getSessionFromRequest(req);
  if (!s) return null;
  return s;
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const resolved = searchParams.get('resolved');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = 25;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (resolved === 'true') where.resolved = true;
  if (resolved === 'false') where.resolved = false;

  const [flags, total] = await Promise.all([
    prisma.antiFraudLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, eventType: true, severity: true, score: true,
        action: true, details: true, resolved: true,
        submissionId: true, userId: true, expertId: true,
        createdAt: true,
      },
    }),
    prisma.antiFraudLog.count({ where }),
  ]);

  return NextResponse.json({ flags, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { flagId, resolved } = await req.json();
  if (!flagId) return NextResponse.json({ error: 'flagId required' }, { status: 400 });

  const flag = await prisma.antiFraudLog.update({
    where: { id: flagId },
    data: { resolved },
    select: { id: true, resolved: true },
  });
  return NextResponse.json({ flag });
}
