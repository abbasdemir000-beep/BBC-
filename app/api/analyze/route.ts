import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { routeToExperts } from '@/lib/ai/router';
import { geminiAnalyze, geminiEmbed } from '@/lib/ai/geminiAnalyzer';
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

  // Classify with Gemini 1.5 Pro (falls back to heuristic engine if key not set)
  const classification = await geminiAnalyze(text);

  // Generate embedding (Gemini text-embedding-004 or fallback)
  const embedding = await geminiEmbed(text);

  // Find domain by slug
  const domain = await prisma.domain.findUnique({ where: { slug: classification.detectedDomain } });

  // Persist analysis
  const analysis = await prisma.aIAnalysis.upsert({
    where: { consultationId },
    update: {
      detectedDomain: classification.detectedDomain,
      detectedSubDomain: classification.detectedSubDomain,
      detectedTopic: classification.detectedTopic,
      questionType: classification.questionType,
      difficulty: classification.difficulty,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      embeddingVector: JSON.stringify(embedding),
      safetyFlags: JSON.stringify(classification.safetyFlags),
      isSafe: classification.isSafe,
      processingTimeMs: Date.now() - start,
      modelUsed: classification.modelUsed,
    },
    create: {
      consultationId,
      detectedDomain: classification.detectedDomain,
      detectedSubDomain: classification.detectedSubDomain,
      detectedTopic: classification.detectedTopic,
      questionType: classification.questionType,
      difficulty: classification.difficulty,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      embeddingVector: JSON.stringify(embedding),
      safetyFlags: JSON.stringify(classification.safetyFlags),
      isSafe: classification.isSafe,
      processingTimeMs: Date.now() - start,
      modelUsed: classification.modelUsed,
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
            body: `"${consultation.title}" — domain: ${classification.detectedDomain}`,
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
