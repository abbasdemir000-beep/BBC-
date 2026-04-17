import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateExam } from '@/lib/ai/examGenerator';
import { z } from 'zod';

const GenerateSchema = z.object({
  consultationId: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { consultationId } = GenerateSchema.parse(body);

  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { aiAnalysis: true, topic: true },
  });
  if (!consultation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const topic = consultation.aiAnalysis?.detectedTopic ?? consultation.topic?.name ?? 'General';
  const subTopic = consultation.aiAnalysis?.detectedSubDomain ?? 'General';
  const difficulty = consultation.difficulty ?? 'intermediate';

  const generated = await generateExam(topic, subTopic, difficulty, 10);

  const exam = await prisma.exam.upsert({
    where: { consultationId },
    update: {
      topic,
      subTopic,
      difficulty,
      questions: JSON.stringify(generated.questions),
      totalPoints: generated.totalPoints,
      timeLimitSecs: generated.timeLimitSecs,
    },
    create: {
      consultationId,
      topic,
      subTopic,
      difficulty,
      questions: JSON.stringify(generated.questions),
      totalPoints: generated.totalPoints,
      timeLimitSecs: generated.timeLimitSecs,
    },
  });

  // Update consultation status
  await prisma.consultation.update({
    where: { id: consultationId },
    data: { status: 'examining' },
  });

  return NextResponse.json({ exam, coverageAreas: generated.coverageAreas });
}
