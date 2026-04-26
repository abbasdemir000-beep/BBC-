export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const consultations = await prisma.consultation.findMany({
    where: { userId: session.id },
    include: {
      domain: { select: { name: true, icon: true, color: true } },
      submissions: {
        include: {
          expert: { select: { name: true, domain: { select: { name: true, icon: true } } } },
        },
        orderBy: { finalScore: 'desc' },
      },
      chatRooms: {
        where: { isActive: true },
        select: { id: true, expertId: true, isActive: true },
      },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ consultations, total: consultations.length });
}
