import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 100);
  const search = url.searchParams.get('search') ?? '';
  const verified = url.searchParams.get('verified');

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (verified === 'true') where.isVerified = true;
  if (verified === 'false') where.isVerified = false;

  const [experts, total] = await Promise.all([
    prisma.expert.findMany({
      where,
      select: {
        id: true, name: true, email: true, isVerified: true, isAvailable: true,
        rating: true, yearsExperience: true, createdAt: true,
        domain: { select: { name: true, icon: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expert.count({ where }),
  ]);

  return NextResponse.json({ experts, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { expertId, isVerified, isAvailable } = body;

  if (!expertId) return NextResponse.json({ error: 'expertId required' }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (isVerified !== undefined) data.isVerified = Boolean(isVerified);
  if (isAvailable !== undefined) data.isAvailable = Boolean(isAvailable);

  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  const expert = await prisma.expert.update({ where: { id: expertId }, data, select: { id: true, name: true, isVerified: true, isAvailable: true } });
  return NextResponse.json({ expert, ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { expertId } = await req.json();
  if (!expertId) return NextResponse.json({ error: 'expertId required' }, { status: 400 });

  await prisma.expert.delete({ where: { id: expertId } });
  return NextResponse.json({ ok: true });
}
