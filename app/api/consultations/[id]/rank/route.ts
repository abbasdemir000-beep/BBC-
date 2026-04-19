import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { calcFinalScore, pointsToUSD } from '@/lib/utils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const consultation = await prisma.consultation.findUnique({
    where: { id: params.id },
    include: {
      submissions: {
        where: { status: { not: 'disqualified' } },
        include: { examResult: true, expert: true },
      },
    },
  });
  if (!consultation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session.id !== consultation.userId && session.email !== 'abbasdemir000@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (consultation.submissions.length === 0) {
    return NextResponse.json({ error: 'No valid submissions to rank' }, { status: 400 });
  }

  // Calculate final scores for all submissions
  const scored = consultation.submissions.map(s => {
    const aiScore   = s.aiScore ?? 0;
    const examScore = s.examResult?.score ?? 0;
    const userRating = s.userRating ?? 3;
    const final = calcFinalScore(aiScore, examScore, userRating * 20);
    return { ...s, computedFinal: final };
  }).sort((a, b) => b.computedFinal - a.computedFinal);

  // Update rankings
  for (let i = 0; i < scored.length; i++) {
    const isWinner = i === 0 && scored[i].computedFinal >= 40;
    await prisma.submission.update({
      where: { id: scored[i].id },
      data: {
        finalScore: scored[i].computedFinal,
        rank: i + 1,
        status: isWinner ? 'winner' : 'ranked',
      },
    });
  }

  // Create reward for winner
  const winner = scored[0];
  if (winner && winner.computedFinal >= 40) {
    const prizePoints = consultation.prizePoints;
    await prisma.reward.create({
      data: {
        expertId: winner.expertId,
        consultationId: consultation.id,
        type: 'win_points',
        points: prizePoints,
        moneyValue: pointsToUSD(prizePoints),
        status: 'available',
        description: `Won competition: "${consultation.title.slice(0, 60)}" with score ${winner.computedFinal.toFixed(1)}`,
      },
    });

    // Update expert win stats
    await prisma.expert.update({
      where: { id: winner.expertId },
      data: { totalWins: { increment: 1 } },
    });
  }

  // Close consultation
  await prisma.consultation.update({
    where: { id: params.id },
    data: { status: 'completed', closedAt: new Date() },
  });

  return NextResponse.json({
    rankings: scored.map((s, i) => ({
      rank: i + 1,
      expertId: s.expertId,
      expertName: s.expert.name,
      finalScore: s.computedFinal,
      aiScore: s.aiScore,
      examScore: s.examResult?.score ?? 0,
      status: i === 0 && s.computedFinal >= 40 ? 'winner' : 'ranked',
    })),
    winner: winner ? { expertId: winner.expertId, expertName: winner.expert.name, score: winner.computedFinal, prizePoints: consultation.prizePoints } : null,
  });
}
