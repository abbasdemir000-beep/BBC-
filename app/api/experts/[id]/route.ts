import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const expert = await prisma.expert.findUnique({
    where: { id: params.id },
    include: {
      domain: true,
      subDomain: true,
      credentials: true,
      reviews: { take: 10, orderBy: { createdAt: 'desc' } },
      submissions: {
        select: { id: true, finalScore: true, rank: true, status: true, submittedAt: true },
        orderBy: { submittedAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!expert) return NextResponse.json({ error: 'Expert not found' }, { status: 404 });
  return NextResponse.json(expert);
}
