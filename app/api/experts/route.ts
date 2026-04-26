export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
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
      include: { domain: true, credentials: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { rating: 'desc' },
    }),
    prisma.expert.count({ where }),
  ]);

  return NextResponse.json({ experts, total, page, limit, pages: Math.ceil(total / limit) });
}
