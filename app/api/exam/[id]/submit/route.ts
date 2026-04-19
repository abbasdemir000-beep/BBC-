import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { gradeOpenExam } from '@/lib/ai/examGenerator';
import { calcFinalScore } from '@/lib/utils';
import { z } from 'zod';

const SubmitExamSchema = z.object({
  submissionId: z.string(),
  answers: z.record(z.string()),
  timeTakenSecs: z.number().min(0),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'expert' || !session.expertId) {
    return NextResponse.json({ error: 'Expert account required' }, { status: 403 });
  }
  const expertId = session.expertId;

  const body = await req.json();
  const data = SubmitExamSchema.parse(body);

  const exam = await prisma.exam.findUnique({ where: { id: params.id } });
  if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

  const submission = await prisma.submission.findUnique({ where: { id: data.submissionId } });
  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  if (submission.expertId !== expertId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const questions = JSON.parse(exam.questions);
  const { score, feedback, breakdown } = await gradeOpenExam(questions, data.answers);

  const examResult = await prisma.examResult.upsert({
    where: { submissionId: data.submissionId },
    update: { answers: JSON.stringify(data.answers), score, timeTakenSecs: data.timeTakenSecs, completedAt: new Date(), feedback },
    create: {
      examId: exam.id,
      expertId: expertId,
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

  // Unlock chat room if exam score ≥ 60
  if (score >= 60) {
    const consultation = await prisma.consultation.findUnique({ where: { id: exam.consultationId } });
    if (consultation) {
      try {
        const room = await prisma.chatRoom.upsert({
          where: { consultationId_expertId: { consultationId: exam.consultationId, expertId: expertId } },
          update: { isActive: true },
          create: { consultationId: exam.consultationId, expertId: expertId, userId: consultation.userId },
        });

        // Notify user that expert passed exam and chat is open
        const expert = await prisma.expert.findUnique({ where: { id: expertId } });
        await prisma.notification.create({
          data: {
            userId: consultation.userId,
            type: 'chat_unlocked',
            title: 'Expert wants to chat!',
            body: `${expert?.name ?? 'An expert'} passed the exam for your question "${consultation.title}" and is ready to discuss.`,
            consultationId: exam.consultationId,
          },
        });

        return NextResponse.json({ examResult, score, feedback, breakdown, finalScore, chatRoomId: room.id });
      } catch {
        // non-fatal — chat creation failure doesn't block exam completion
      }
    }
  }

  return NextResponse.json({ examResult, score, feedback, breakdown, finalScore });
}
