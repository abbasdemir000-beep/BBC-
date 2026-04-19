import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { checkAdminCookie } from '@/lib/admin-auth';

const PAGE_SIZE = 20;

async function requireAdmin(req: NextRequest) {
  if (checkAdminCookie(req)) return { role: 'admin' };
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
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const skip = (page - 1) * PAGE_SIZE;

    const where = q
      ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { email: { contains: q, mode: 'insensitive' as const } }] }
      : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { consultations: true } },
        },
      }),
    ]);

    return NextResponse.json({ users, total, page, pages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error('[GET /api/admin/users]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { userId, role, isActive } = body;

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (role !== undefined) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;

    const user = await prisma.user.update({ where: { id: userId }, data });
    return NextResponse.json({ user, ok: true });
  } catch (error) {
    console.error('[PATCH /api/admin/users]', error);
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

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/admin/users]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
