import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { geminiAntiCheat } from '@/lib/ai/geminiAntiCheat';
import { geminiEvaluate } from '@/lib/ai/geminiEvaluator';
import { calcFinalScore } from '@/lib/utils';

const SubmitSchema = z.object({
  consultationId: z.string(),
  expertId: z.string(),
  content: z.string().min(20),
  reasoning: z.string().optional(),
  references: z.array(z.string()).default([]),
  timeSpentSeconds: z.number().min(0).default(0),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const consultationId = searchParams.get('consultationId');
  if (!consultationId) return NextResponse.json({ error: 'consultationId required' }, { status: 400 });

  const submissions = await prisma.submission.findMany({
    where: { consultationId },
    include: {
      expert: { select: { id: true, name: true, avatar: true, rating: true } },
      examResult: true,
    },
    orderBy: { finalScore: 'desc' },
  });
  return NextResponse.json({ submissions });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  let data: z.infer<typeof SubmitSchema>;
  try {
    data = SubmitSchema.parse(body);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 422 });
  }

  const consultation = await prisma.consultation.findUnique({
    where: { id: data.consultationId },
    include: { domain: true, topic: true, aiAnalysis: true },
  });
  if (!consultation) return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
  if (!['active', 'routing', 'pending'].includes(consultation.status)) {
    return NextResponse.json({ error: `Consultation status is "${consultation.status}" — not accepting submissions` }, { status: 400 });
  }

  // Check for duplicate submission
  const existing = await prisma.submission.findUnique({
    where: { consultationId_expertId: { consultationId: data.consultationId, expertId: data.expertId } },
  });
  if (existing) return NextResponse.json({ error: 'You have already submitted an answer for this consultation' }, { status: 409 });

  // Anti-fraud via Gemini 1.5 Pro (falls back to heuristic engine if key not set)
  const antiCheat = await geminiAntiCheat(
    data.content,
    consultation.description,
    data.expertId,
  );

  // Evaluation via Gemini 1.5 Pro (falls back to heuristic engine if key not set)
  const domainSlug = consultation.domain?.slug ?? consultation.aiAnalysis?.detectedDomain ?? 'general';
  const difficulty = consultation.difficulty ?? consultation.aiAnalysis?.difficulty ?? 'intermediate';
  const evaluation = await geminiEvaluate(data.content, consultation.description, domainSlug, difficulty);

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
      similarityFlag: antiCheat.plagiarismScore > 0.5,
      plagiarismScore: antiCheat.plagiarismScore,
      anomalyFlags: JSON.stringify(antiCheat.anomalyFlags),
      isFlagged: antiCheat.isFlagged,
      flagReason: antiCheat.flagReason ?? (antiCheat.isFlagged ? antiCheat.action : null),
      status: antiCheat.action === 'disqualify' ? 'disqualified' : 'evaluated',
    },
    include: { expert: { select: { id: true, name: true, avatar: true } } },
  });

  // Log anti-fraud if flagged
  if (antiCheat.isFlagged) {
    const severity = antiCheat.riskScore >= 0.85 ? 'critical'
      : antiCheat.riskScore >= 0.65 ? 'high'
      : antiCheat.riskScore >= 0.50 ? 'medium' : 'low';
    await prisma.antiFraudLog.create({
      data: {
        submissionId: submission.id,
        expertId: data.expertId,
        eventType: antiCheat.anomalyFlags[0] ?? 'fraud_detected',
        severity,
        details: JSON.stringify({ ...antiCheat, confidenceReport: antiCheat.confidenceReport }),
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
