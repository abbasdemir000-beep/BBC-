export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: params.id },
      include: {
        domain: {
          select: { id: true, name: true, slug: true, icon: true, color: true },
        },
        subDomain: {
          select: { id: true, name: true, slug: true },
        },
        credentials: {
          orderBy: { year: 'desc' },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        submissions: {
          include: {
            consultation: {
              select: { id: true, title: true, status: true, prizePoints: true },
            },
          },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        },
        examResults: {
          select: { id: true, score: true, completedAt: true },
        },
      },
    });

    if (!expert) {
      return NextResponse.json({ error: 'Expert not found' }, { status: 404 });
    }

    // Compute aggregate stats from the full submission set
    const allSubmissions = await prisma.submission.findMany({
      where: { expertId: params.id },
      select: {
        finalScore: true,
        examScore: true,
        status: true,
      },
    });

    const totalAnswers = allSubmissions.length;

    const scoredSubmissions = allSubmissions.filter(
      (s) => s.finalScore !== null && s.finalScore !== undefined
    );

    const avgScore =
      scoredSubmissions.length > 0
        ? scoredSubmissions.reduce((sum, s) => sum + (s.finalScore ?? 0), 0) /
          scoredSubmissions.length
        : 0;

    const examResultsWithScore = allSubmissions.filter(
      (s) => s.examScore !== null && s.examScore !== undefined
    );

    const passRate =
      examResultsWithScore.length > 0
        ? examResultsWithScore.filter((s) => (s.examScore ?? 0) >= 60).length /
          examResultsWithScore.length
        : 0;

    const stats = {
      totalAnswers,
      avgScore: Math.round(avgScore * 100) / 100,
      passRate: Math.round(passRate * 10000) / 100, // percentage, 2 decimal places
      examResultsCount: expert.examResults.length,
    };

    // Strip the heavy examResults array from the response (count is in stats)
    const { examResults, ...expertWithoutExamResults } = expert;
    void examResults; // consumed above

    return NextResponse.json({ ...expertWithoutExamResults, stats });
  } catch (error) {
    console.error('[GET /api/experts/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
