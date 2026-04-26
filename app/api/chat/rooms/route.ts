export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const consultationId = searchParams.get('consultationId');

  const where = consultationId
    ? {
        consultationId,
        ...(session.role === 'expert' ? { expertId: session.expertId } : { userId: session.id }),
      }
    : session.role === 'expert'
      ? { expertId: session.expertId }
      : { userId: session.id };

  if (consultationId) {
    const room = await prisma.chatRoom.findFirst({ where, include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } } });
    return NextResponse.json({ room });
  }

  const rooms = await prisma.chatRoom.findMany({
    where,
    include: {
      consultation: { select: { title: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { unlockedAt: 'desc' },
  });

  return NextResponse.json({ rooms });
}
