import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

const PAGE_SIZE = 20;

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return null;
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';
    const status = searchParams.get('status') ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const skip = (page - 1) * PAGE_SIZE;

    const where: Record<string, unknown> = {};
    if (q) where.title = { contains: q, mode: 'insensitive' };
    if (status) where.status = status;

    const [total, consultations] = await Promise.all([
      prisma.consultation.count({ where }),
      prisma.consultation.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          isPublic: true,
          prizePoints: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          domain: { select: { name: true } },
          _count: { select: { submissions: true } },
        },
      }),
    ]);

    return NextResponse.json({ consultations, total, page, pages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error('[GET /api/admin/consultations]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { consultationId, status, isPublic } = body;

    if (!consultationId) return NextResponse.json({ error: 'consultationId required' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (isPublic !== undefined) data.isPublic = isPublic;

    const consultation = await prisma.consultation.update({ where: { id: consultationId }, data });
    return NextResponse.json({ consultation, ok: true });
  } catch (error) {
    console.error('[PATCH /api/admin/consultations]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await prisma.consultation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/admin/consultations]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
