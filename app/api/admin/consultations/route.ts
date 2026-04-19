import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

async function requireAuth(req: NextRequest) {
  const s = await getSessionFromRequest(req);
  if (!s) return null;
  return s;
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = 25;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (q) where.title = { contains: q, mode: 'insensitive' };
  if (status) where.status = status;

  const [consultations, total] = await Promise.all([
    prisma.consultation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, status: true, urgency: true,
        difficulty: true, prizePoints: true, isPublic: true,
        language: true, createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        domain: { select: { id: true, name: true, icon: true } },
        _count: { select: { submissions: true } },
      },
    }),
    prisma.consultation.count({ where }),
  ]);

  return NextResponse.json({ consultations, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { consultationId, status, isPublic } = await req.json();
  if (!consultationId) return NextResponse.json({ error: 'consultationId required' }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (isPublic !== undefined) data.isPublic = isPublic;

  const consultation = await prisma.consultation.update({
    where: { id: consultationId },
    data,
    select: { id: true, title: true, status: true, isPublic: true },
  });
  return NextResponse.json({ consultation });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.consultation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
