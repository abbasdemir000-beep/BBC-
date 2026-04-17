import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gradeExam } from '@/lib/ai/examGenerator';
import { calcFinalScore } from '@/lib/utils';
import { z } from 'zod';

const SubmitExamSchema = z.object({
  expertId: z.string(),
  submissionId: z.string(),
  answers: z.record(z.string()),
  timeTakenSecs: z.number().min(0),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data = SubmitExamSchema.parse(body);

  const exam = await prisma.exam.findUnique({ where: { id: params.id } });
  if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

  const submission = await prisma.submission.findUnique({ where: { id: data.submissionId } });
  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

  const questions = JSON.parse(exam.questions);
  const { score, feedback, breakdown } = await gradeExam(questions, data.answers);

  const examResult = await prisma.examResult.upsert({
    where: { submissionId: data.submissionId },
    update: { answers: JSON.stringify(data.answers), score, timeTakenSecs: data.timeTakenSecs, completedAt: new Date(), feedback },
    create: {
      examId: exam.id,
      expertId: data.expertId,
      submissionId: data.submissionId,
      answers: JSON.stringify(data.answers),
      score,
      timeTakenSecs: data.timeTakenSecs,
      completedAt: new Date(),
      feedback,
    },
  });

  // Recalculate final score
  const aiScore = submission.aiScore ?? 0;
  const userRating = submission.userRating ?? 0;
  const finalScore = calcFinalScore(aiScore, score, userRating * 20);

  await prisma.submission.update({
    where: { id: data.submissionId },
    data: { examScore: score, finalScore, status: 'exam_completed' },
  });

  return NextResponse.json({ examResult, score, feedback, breakdown, finalScore });
}
