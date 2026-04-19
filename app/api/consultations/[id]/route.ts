import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

  if (!consultation.isPublic) {
    const session = await getSessionFromRequest(req);
    if (!session || (session.id !== consultation.userId && session.email !== 'abbasdemir000@gmail.com')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.json(consultation);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const consultation = await prisma.consultation.findUnique({ where: { id: params.id }, select: { userId: true } });
  if (!consultation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isOwner = session.id === consultation.userId;
  const isAdmin = session.email === 'abbasdemir000@gmail.com';
  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const allowed = ['status', 'urgency', 'isPublic'];
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const updated = await prisma.consultation.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(updated);
}
