import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'expert' || !session.expertId) {
    return NextResponse.json({ error: 'Expert access required' }, { status: 403 });
  }

  // Fetch expert's textLanguages to filter consultations by language
  const expertRecord = await prisma.expert.findUnique({
    where: { id: session.expertId },
    select: { textLanguages: true },
  });
  const textLanguages: string[] = expertRecord?.textLanguages
    ? (JSON.parse(expertRecord.textLanguages) as string[])
    : ['en'];

  // Get all consultations routed to this expert
  const routings = await prisma.expertRouting.findMany({
    where: { expertId: session.expertId },
    include: {
      consultation: {
        include: {
          domain: true,
          user: { select: { id: true } },
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

  const targeted = routings
    .filter(r => textLanguages.includes(r.consultation.language ?? 'en'))
    .map(r => ({
      routingId: r.id,
      similarityScore: r.similarityScore,
      rank: r.rankPosition,
      accepted: r.accepted,
      consultation: {
        ...r.consultation,
        user: { id: r.consultation.user.id, name: 'Anonymous', avatar: null },
      },
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
