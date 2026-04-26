export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { smartClassify, smartEmbedding } from '@/lib/ai/smartEngine';
import { routeToExperts } from '@/lib/ai/router';
import { z } from 'zod';

const AnalyzeSchema = z.object({
  consultationId: z.string(),
  text: z.string().min(3),
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

  // Classify with smart rule-based engine (zero API calls)
  const classification = smartClassify(text);

  // Generate deterministic embedding
  const embedding = smartEmbedding(text);

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
      modelUsed: 'smart-engine-v1',
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
      modelUsed: 'smart-engine-v1',
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

  // Route to top matching experts via embedding similarity
  let routings: unknown[] = [];
  if (classification.isSafe && domain) {
    try {
      routings = await routeToExperts(consultationId, domain.slug, embedding, 5);

      // Notify each routed expert
      const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
      if (consultation) {
        const routingRecords = routings as Array<{ expertId: string }>;
        await prisma.notification.createMany({
          data: routingRecords.map(r => ({
            expertId: r.expertId,
            type: 'targeted',
            title: 'New question matches your expertise',
            body: `"${consultation.title}" — domain: ${classification.domain}`,
            consultationId,
          })),
          skipDuplicates: true,
        });
      }
    } catch {
      // non-fatal — routing failure doesn't block analysis
    }
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
