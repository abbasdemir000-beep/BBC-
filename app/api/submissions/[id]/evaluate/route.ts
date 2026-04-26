export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calcFinalScore } from '@/lib/utils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { userRating } = body as { userRating?: number };

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: { examResult: true },
  });
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const examScore = submission.examResult?.score ?? 0;
  const rating = userRating ?? submission.userRating ?? 0;
  const aiScore = submission.aiScore ?? 0;
  const finalScore = calcFinalScore(aiScore, examScore, rating * 20); // rating 1-5 → 0-100

  const updated = await prisma.submission.update({
    where: { id: params.id },
    data: { userRating: rating, finalScore, status: 'ranked' },
  });

  return NextResponse.json({ submission: updated, finalScore });
}
