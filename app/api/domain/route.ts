import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const withSubs = searchParams.get('withSubDomains') === 'true';

  const domains = await prisma.domain.findMany({
    where: { isActive: true },
    include: withSubs ? { subDomains: { include: { topics: true } } } : undefined,
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ domains, total: domains.length });
}
