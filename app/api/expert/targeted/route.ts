import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'expert' || !session.expertId) {
    return NextResponse.json({ error: 'Expert access required' }, { status: 403 });
  }

  // Get all consultations routed to this expert
  const routings = await prisma.expertRouting.findMany({
    where: { expertId: session.expertId },
    include: {
      consultation: {
        include: {
          domain: true,
          user: { select: { id: true, name: true, avatar: true } },
          aiAnalysis: true,
          submissions: {
            where: { expertId: session.expertId },
            select: { id: true, status: true, aiScore: true, examScore: true, finalScore: true },
          },
          _count: { select: { submissions: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const targeted = routings.map(r => ({
    routingId: r.id,
    similarityScore: r.similarityScore,
    rank: r.rankPosition,
    accepted: r.accepted,
    consultation: r.consultation,
    mySubmission: r.consultation.submissions[0] ?? null,
  }));

  return NextResponse.json({ targeted, total: targeted.length });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !session.expertId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { routingId, accepted } = await req.json() as { routingId: string; accepted: boolean };

  const routing = await prisma.expertRouting.update({
    where: { id: routingId },
    data: { accepted },
  });

  return NextResponse.json({ routing });
}
