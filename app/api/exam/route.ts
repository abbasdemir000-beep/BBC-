import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { smartGenerateOpenExam } from '@/lib/ai/smartEngine';
import { z } from 'zod';

const GenerateSchema = z.object({ consultationId: z.string() });

export async function POST(req: NextRequest) {
  const body = await req.json();
  let consultationId: string;
  try { ({ consultationId } = GenerateSchema.parse(body)); }
  catch (err) { return NextResponse.json({ error: String(err) }, { status: 422 }); }

  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { aiAnalysis: true, domain: true },
  });
  if (!consultation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const topic = consultation.aiAnalysis?.detectedTopic ?? 'General';
  const domain = consultation.aiAnalysis?.detectedDomain ?? consultation.domain?.slug ?? 'general';
  const difficulty = consultation.difficulty ?? 'intermediate';

  const generated = smartGenerateOpenExam(topic, domain, difficulty);

  const exam = await prisma.exam.upsert({
    where: { consultationId },
    update: { topic, subTopic: consultation.aiAnalysis?.detectedSubDomain ?? 'General', difficulty, questions: JSON.stringify(generated.questions), totalPoints: generated.totalPoints, timeLimitSecs: generated.timeLimitSecs },
    create: { consultationId, topic, subTopic: consultation.aiAnalysis?.detectedSubDomain ?? 'General', difficulty, questions: JSON.stringify(generated.questions), totalPoints: generated.totalPoints, timeLimitSecs: generated.timeLimitSecs },
  });

  await prisma.consultation.update({ where: { id: consultationId }, data: { status: 'examining' } });

  return NextResponse.json({ exam, topic, domain });
}
