import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { smartClassify, smartEmbedding } from '@/lib/ai/smartEngine';
import { routeToExperts } from '@/lib/ai/router';
import { z } from 'zod';

const AnalyzeSchema = z.object({
  consultationId: z.string(),
  text: z.string().min(3),
});

// Claude API classification (used when ANTHROPIC_API_KEY is set)
async function claudeClassify(text: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: 'You are an expert question classifier. Respond ONLY with a valid JSON object, no markdown.',
        messages: [{
          role: 'user',
          content: `Classify this question. Return JSON with keys: domain (slug like "medicine","law","computer-science","mathematics","physics","engineering","biology","chemistry","psychology","business","economics","history","education","philosophy","arts"), subDomain (string), topic (string), questionType ("explanation"|"problem_solving"|"advice"|"diagnosis"|"review"), difficulty ("beginner"|"intermediate"|"advanced"|"expert"), confidence (0-1 float), reasoning (1 sentence), isSafe (boolean).\n\nQuestion: ${text.slice(0, 800)}`,
        }],
      }),
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    const raw = data.content?.[0]?.text ?? '';
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  const body = await req.json();

  let consultationId: string, text: string;
  try {
    ({ consultationId, text } = AnalyzeSchema.parse(body));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 422 });
  }

  // Try Claude API first, fall back to smart rule-based engine
  const claudeResult = await claudeClassify(text);
  const classification = claudeResult ?? smartClassify(text);
  const modelUsed = claudeResult ? 'claude-haiku-4-5-20251001' : 'smart-engine-v1';

  // Generate deterministic embedding
  const embedding = smartEmbedding(text);

  // Find domain by slug
  const domain = await prisma.domain.findUnique({ where: { slug: classification.domain } });

  // Persist analysis
  const analysis = await prisma.aIAnalysis.upsert({
    where: { consultationId },
    update: {
      detectedDomain: classification.domain,
      detectedSubDomain: classification.subDomain ?? '',
      detectedTopic: classification.topic ?? '',
      questionType: classification.questionType,
      difficulty: classification.difficulty,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      embeddingVector: JSON.stringify(embedding),
      safetyFlags: JSON.stringify(classification.safetyFlags ?? []),
      isSafe: classification.isSafe ?? true,
      processingTimeMs: Date.now() - start,
      modelUsed,
    },
    create: {
      consultationId,
      detectedDomain: classification.domain,
      detectedSubDomain: classification.subDomain ?? '',
      detectedTopic: classification.topic ?? '',
      questionType: classification.questionType,
      difficulty: classification.difficulty,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      embeddingVector: JSON.stringify(embedding),
      safetyFlags: JSON.stringify(classification.safetyFlags ?? []),
      isSafe: classification.isSafe ?? true,
      processingTimeMs: Date.now() - start,
      modelUsed,
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
        status: (classification.isSafe ?? true) ? 'routing' : 'cancelled',
      },
    });
  }

  // Route to top matching experts via embedding similarity
  let routings: unknown[] = [];
  if ((classification.isSafe ?? true) && domain) {
    try {
      routings = await routeToExperts(consultationId, domain.slug, embedding, 5);

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
      // non-fatal
    }
    await prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'active' },
    });
  }

  return NextResponse.json({
    analysis,
    routings,
    modelUsed,
    processingTimeMs: Date.now() - start,
  });
}
