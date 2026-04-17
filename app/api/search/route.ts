import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all'; // all | experts | consultations | domains

  if (!q.trim()) return NextResponse.json({ results: [] });

  const [experts, consultations, domains] = await Promise.all([
    type !== 'consultations' && type !== 'domains'
      ? prisma.expert.findMany({
          where: { OR: [{ name: { contains: q } }, { bio: { contains: q } }] },
          include: { domain: true },
          take: 5,
        })
      : [],
    type !== 'experts' && type !== 'domains'
      ? prisma.consultation.findMany({
          where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] },
          include: { domain: true },
          take: 5,
        })
      : [],
    type !== 'experts' && type !== 'consultations'
      ? prisma.domain.findMany({
          where: { OR: [{ name: { contains: q } }, { description: { contains: q } }] },
          take: 5,
        })
      : [],
  ]);

  return NextResponse.json({ experts, consultations, domains, query: q });
}
