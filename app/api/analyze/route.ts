import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { classifyQuestion, generateEmbedding } from '@/lib/ai/classifier';
import { routeToExperts } from '@/lib/ai/router';
import { z } from 'zod';

const AnalyzeSchema = z.object({
  consultationId: z.string(),
  text: z.string().min(10),
});

export async function POST(req: NextRequest) {
  const start = Date.now();
  const body = await req.json();

  let consultationId: string, text: string;
  try {
    ({ consultationId, text } = AnalyzeSchema.parse(body));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 422 });
  }

  // Get available domain slugs
  const domains = await prisma.domain.findMany({ select: { slug: true }, where: { isActive: true } });
  const domainSlugs = domains.map(d => d.slug);

  // Classify
  let classification;
  try {
    classification = await classifyQuestion(text, domainSlugs);
  } catch (err) {
    console.error('Classification error:', err);
    return NextResponse.json({ error: `AI classification failed: ${String(err)}` }, { status: 502 });
  }

  // Generate embedding
  const embedding = await generateEmbedding(text);

  // Find domain by slug
  const domain = await prisma.domain.findUnique({ where: { slug: classification.domain } });

  // Persist analysis
  const analysis = await prisma.aIAnalysis.upsert({
    where: { consultationId },
    update: {
      detectedDomain: classification.domain,
      detectedSubDomain: classification.subDomain,
      detectedTopic: classification.topic,
      questionType: classification.questionType,
      difficulty: classification.difficulty,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      embeddingVector: JSON.stringify(embedding),
      safetyFlags: JSON.stringify(classification.safetyFlags),
      isSafe: classification.isSafe,
      processingTimeMs: Date.now() - start,
    },
    create: {
      consultationId,
      detectedDomain: classification.domain,
      detectedSubDomain: classification.subDomain,
      detectedTopic: classification.topic,
      questionType: classification.questionType,
      difficulty: classification.difficulty,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      embeddingVector: JSON.stringify(embedding),
      safetyFlags: JSON.stringify(classification.safetyFlags),
      isSafe: classification.isSafe,
      processingTimeMs: Date.now() - start,
    },
  });

  // Update consultation with detected domain
  if (domain) {
    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        domainId: domain.id,
        questionType: classification.questionType,
        difficulty: classification.difficulty,
        status: classification.isSafe ? 'routing' : 'cancelled',
      },
    });
  }

  // Route to top experts if safe
  let routings: unknown[] = [];
  if (classification.isSafe && domain) {
    routings = await routeToExperts(consultationId, domain.slug, embedding, 5);
    await prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'active' },
    });
  }

  return NextResponse.json({
    analysis,
    routings,
    processingTimeMs: Date.now() - start,
  });
}
