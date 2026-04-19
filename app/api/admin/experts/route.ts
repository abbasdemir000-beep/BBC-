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
  const verified = searchParams.get('verified');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = 25;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }];
  if (verified === 'true') where.isVerified = true;
  if (verified === 'false') where.isVerified = false;

  const [experts, total] = await Promise.all([
    prisma.expert.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, bio: true,
        yearsExperience: true, rating: true, totalWins: true,
        isVerified: true, isAvailable: true, examLanguage: true,
        createdAt: true, lastSeenAt: true,
        domain: { select: { id: true, name: true, icon: true } },
        _count: { select: { submissions: true } },
      },
    }),
    prisma.expert.count({ where }),
  ]);

  return NextResponse.json({ experts, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { expertId, isVerified, isAvailable } = await req.json();
  if (!expertId) return NextResponse.json({ error: 'expertId required' }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (isVerified !== undefined) data.isVerified = isVerified;
  if (isAvailable !== undefined) data.isAvailable = isAvailable;

  const expert = await prisma.expert.update({
    where: { id: expertId },
    data,
    select: { id: true, name: true, isVerified: true, isAvailable: true },
  });

  if (isVerified !== undefined) {
    await prisma.notification.create({
      data: {
        expertId,
        type: 'targeted',
        title: isVerified ? 'Account Verified!' : 'Verification Revoked',
        body: isVerified
          ? 'Your expert account has been verified by an administrator.'
          : 'Your expert verification has been revoked. Please contact support.',
      },
    });
  }

  return NextResponse.json({ expert });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.expert.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
