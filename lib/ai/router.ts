import { prisma } from '@/lib/prisma';
import { cosineSimilarity } from './classifier';

export interface RoutingResult {
  expertId: string;
  expertName: string;
  similarityScore: number;
  rank: number;
}

export async function routeToExperts(
  consultationId: string,
  domainSlug: string,
  questionEmbedding: number[],
  topN: number = 5
): Promise<RoutingResult[]> {
  const domain = await prisma.domain.findUnique({ where: { slug: domainSlug } });
  if (!domain) return [];

  const experts = await prisma.expert.findMany({
    where: {
      domainId: domain.id,
      isAvailable: true,
    },
    select: { id: true, name: true, embeddingVector: true },
  });

  const scored: RoutingResult[] = experts
    .filter(e => e.embeddingVector)
    .map(e => {
      const vec = JSON.parse(e.embeddingVector!) as number[];
      const score = cosineSimilarity(questionEmbedding, vec);
      return { expertId: e.id, expertName: e.name, similarityScore: score, rank: 0 };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, topN)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  // Persist routing decisions
  for (const r of scored) {
    await prisma.expertRouting.upsert({
      where: { consultationId_expertId: { consultationId, expertId: r.expertId } },
      create: {
        consultationId,
        expertId: r.expertId,
        similarityScore: r.similarityScore,
        rankPosition: r.rank,
        notified: true,
      },
      update: { similarityScore: r.similarityScore, rankPosition: r.rank },
    });
  }

  return scored;
}
