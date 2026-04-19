import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
  const limit = parseInt(searchParams.get('limit') || '12');
  const domain = searchParams.get('domain');
  const search = searchParams.get('search');
  const verified = searchParams.get('verified');

  const where = {
    ...(domain ? { domain: { slug: domain } } : {}),
    ...(verified === 'true' ? { isVerified: true } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search } },
        { bio: { contains: search } },
      ],
    } : {}),
  };

  const [experts, total] = await Promise.all([
    prisma.expert.findMany({
      where,
      select: {
        id: true, name: true, avatar: true, bio: true,
        yearsExperience: true, hourlyRate: true, rating: true,
        totalReviews: true, totalWins: true, winRate: true,
        isAvailable: true, isVerified: true, responseTime: true,
        examLanguage: true, textLanguages: true, createdAt: true,
        domain: true,
        credentials: { select: { id: true, title: true, issuer: true, year: true, verified: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { rating: 'desc' },
    }),
    prisma.expert.count({ where }),
  ]);

  return NextResponse.json({ experts, total, page, limit, pages: Math.ceil(total / limit) });
}
