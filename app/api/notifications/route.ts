export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: session.role === 'expert'
      ? { expertId: session.expertId }
      : { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  return NextResponse.json({ notifications });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids } = await req.json() as { ids?: string[] };

  await prisma.notification.updateMany({
    where: {
      ...(ids ? { id: { in: ids } } : {}),
      ...(session.role === 'expert' ? { expertId: session.expertId } : { userId: session.id }),
    },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
