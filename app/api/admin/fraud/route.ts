import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const resolved = url.searchParams.get('resolved');
  const severity = url.searchParams.get('severity');

  const where: Record<string, unknown> = {};
  if (resolved === 'true') where.resolved = true;
  if (resolved === 'false') where.resolved = false;
  if (severity) where.severity = severity;

  const flags = await prisma.antiFraudLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, eventType: true, severity: true, score: true, action: true, details: true, resolved: true, createdAt: true, submissionId: true, userId: true, expertId: true },
  });

  return NextResponse.json({ flags });
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { flagId, resolved } = body;
  if (!flagId) return NextResponse.json({ error: 'flagId required' }, { status: 400 });

  const flag = await prisma.antiFraudLog.update({ where: { id: flagId }, data: { resolved: Boolean(resolved) }, select: { id: true, resolved: true } });
  return NextResponse.json({ flag, ok: true });
}
