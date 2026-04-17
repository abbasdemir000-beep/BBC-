import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { evaluateSubmission } from '@/lib/ai/evaluator';
import { runAntiCheat } from '@/lib/ai/antiCheat';
import { calcFinalScore } from '@/lib/utils';

const SubmitSchema = z.object({
  consultationId: z.string(),
  expertId: z.string(),
  content: z.string().min(50),
  reasoning: z.string().optional(),
  references: z.array(z.string()).default([]),
  timeSpentSeconds: z.number().min(0).default(0),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = SubmitSchema.parse(body);

  const consultation = await prisma.consultation.findUnique({
    where: { id: data.consultationId },
    include: { domain: true, topic: true, aiAnalysis: true },
  });
  if (!consultation) return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
  if (!['active', 'routing'].includes(consultation.status)) {
    return NextResponse.json({ error: 'Consultation not accepting submissions' }, { status: 400 });
  }

  // Get previous submissions for plagiarism check
  const previous = await prisma.submission.findMany({
    where: { consultationId: data.consultationId },
    select: { content: true },
  });

  // Anti-cheat check
  const antiCheat = await runAntiCheat(
    data.content,
    data.expertId,
    previous.map(s => s.content),
    data.timeSpentSeconds
  );

  // AI Evaluation
  const evaluation = await evaluateSubmission(
    consultation.description,
    data.content,
    consultation.domain?.name ?? 'General',
    consultation.topic?.name ?? consultation.aiAnalysis?.detectedTopic ?? 'General'
  );

  // Create submission
  const submission = await prisma.submission.create({
    data: {
      consultationId: data.consultationId,
      expertId: data.expertId,
      content: data.content,
      reasoning: data.reasoning,
      references: JSON.stringify(data.references),
      timeSpentSeconds: data.timeSpentSeconds,
      accuracyScore: evaluation.accuracyScore,
      reasoningScore: evaluation.reasoningScore,
      completenessScore: evaluation.completenessScore,
      clarityScore: evaluation.clarityScore,
      aiScore: evaluation.aiScore,
      aiGeneratedProb: antiCheat.aiGeneratedProb,
      similarityFlag: antiCheat.similarityFlag,
      plagiarismScore: antiCheat.plagiarismScore,
      anomalyFlags: JSON.stringify(antiCheat.anomalyFlags),
      isFlagged: antiCheat.isFlagged,
      flagReason: antiCheat.isFlagged ? antiCheat.action : null,
      status: antiCheat.action === 'disqualify' ? 'disqualified' : 'evaluated',
    },
    include: { expert: { select: { id: true, name: true, avatar: true } } },
  });

  // Log anti-fraud
  if (antiCheat.isFlagged) {
    await prisma.antiFraudLog.create({
      data: {
        submissionId: submission.id,
        expertId: data.expertId,
        eventType: antiCheat.anomalyFlags[0] ?? 'unknown',
        severity: antiCheat.riskScore > 0.8 ? 'high' : 'medium',
        details: JSON.stringify(antiCheat),
        score: antiCheat.riskScore,
        action: antiCheat.action,
      },
    });
  }

  return NextResponse.json({
    submission,
    evaluation,
    antiCheat: { riskScore: antiCheat.riskScore, action: antiCheat.action, isFlagged: antiCheat.isFlagged },
  }, { status: 201 });
}
