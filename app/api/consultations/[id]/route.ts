export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: params.id },
    include: {
      domain: true,
      subDomain: true,
      topic: true,
      user: { select: { id: true, name: true, avatar: true, reputation: true } },
      aiAnalysis: true,
      exam: true,
      routings: { include: { expert: { select: { id: true, name: true, rating: true, avatar: true } } }, orderBy: { rankPosition: 'asc' } },
      submissions: {
        include: {
          expert: { select: { id: true, name: true, avatar: true, rating: true } },
          examResult: true,
        },
        orderBy: { finalScore: 'desc' },
      },
      reviews: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  if (!consultation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(consultation);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const allowed = ['status', 'urgency', 'isPublic'];
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const consultation = await prisma.consultation.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(consultation);
}
