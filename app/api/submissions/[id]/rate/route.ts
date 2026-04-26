export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { calcFinalScore } from '@/lib/utils';

interface RateBody {
  rating: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: RateBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { rating } = body;

    // Validate rating is 1–5
    if (
      typeof rating !== 'number' ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Fetch submission with its parent consultation
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        consultation: {
          select: { userId: true },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Only the consultation owner may rate
    if (submission.consultation.userId !== session.id) {
      return NextResponse.json(
        { error: 'Forbidden: you do not own this consultation' },
        { status: 403 }
      );
    }

    // Derive score components
    const aiScore = submission.aiScore ?? 0;
    const examScore = submission.examScore ?? 0;

    // userRating stored as 0-5; convert to 0-100 for calcFinalScore's third param
    const finalScore = calcFinalScore(aiScore, examScore, rating * 20);

    // Persist rating, finalScore and status
    const updated = await prisma.submission.update({
      where: { id: params.id },
      data: {
        userRating: rating,
        finalScore,
        status: 'rated',
      },
    });

    // Notify the expert
    await prisma.notification.create({
      data: {
        expertId: submission.expertId,
        type: 'answer_evaluated',
        title: 'Your answer was rated!',
        body: `User rated your answer ${rating}/5 stars`,
        consultationId: submission.consultationId,
      },
    });

    return NextResponse.json({ submission: updated, finalScore });
  } catch (error) {
    console.error('[POST /api/submissions/[id]/rate]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
