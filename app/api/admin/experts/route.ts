import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

const PAGE_SIZE = 20;

const ADMIN_EMAIL = 'abbasdemir000@gmail.com';

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.email !== ADMIN_EMAIL) return null;
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';
    const verified = searchParams.get('verified');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const where: Record<string, unknown> = {};
    if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }];
    if (verified === 'true') where.isVerified = true;
    if (verified === 'false') where.isVerified = false;

    const [total, experts] = await Promise.all([
      prisma.expert.count({ where }),
      prisma.expert.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          rating: true,
          totalWins: true,
          isVerified: true,
          isAvailable: true,
          createdAt: true,
          domain: { select: { name: true } },
          _count: { select: { submissions: true } },
        },
      }),
    ]);

    return NextResponse.json({ experts, total, page, pages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error('[GET /api/admin/experts]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { expertId, isVerified, isAvailable } = body;

    if (!expertId) return NextResponse.json({ error: 'expertId required' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (isVerified !== undefined) data.isVerified = isVerified;
    if (isAvailable !== undefined) data.isAvailable = isAvailable;

    const expert = await prisma.expert.update({ where: { id: expertId }, data });
    return NextResponse.json({ expert, ok: true });
  } catch (error) {
    console.error('[PATCH /api/admin/experts]', error);
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

    await prisma.expert.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/admin/experts]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
