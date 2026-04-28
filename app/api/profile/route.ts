import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { z } from 'zod';

const PatchSchema = z.object({
  name:            z.string().min(1).max(80).optional(),
  bio:             z.string().max(500).optional(),
  avatar:          z.string().url().optional(),
  yearsExperience: z.number().min(0).max(60).optional(),
  hourlyRate:      z.number().min(0).optional(),
  isAvailable:     z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, avatar: true, bio: true, role: true, reputation: true, appLanguage: true },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let expert = null;
  if (session.expertId) {
    expert = await prisma.expert.findUnique({
      where: { id: session.expertId },
      select: {
        id: true, name: true, bio: true, avatar: true,
        yearsExperience: true, hourlyRate: true, isAvailable: true,
        rating: true, totalReviews: true, totalWins: true,
        domain: { select: { name: true, icon: true } },
      },
    });
  }

  const submissionCount = session.expertId
    ? await prisma.submission.count({ where: { expertId: session.expertId } })
    : 0;

  return NextResponse.json({ user, expert, submissionCount });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: z.infer<typeof PatchSchema>;
  try {
    body = PatchSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 422 });
  }

  const { name, bio, avatar, yearsExperience, hourlyRate, isAvailable } = body;

  const userUpdate: Record<string, unknown> = {};
  if (name    !== undefined) userUpdate.name   = name;
  if (bio     !== undefined) userUpdate.bio    = bio;
  if (avatar  !== undefined) userUpdate.avatar = avatar;

  if (Object.keys(userUpdate).length > 0) {
    await prisma.user.update({ where: { id: session.id }, data: userUpdate });
  }

  if (session.expertId) {
    const expertUpdate: Record<string, unknown> = {};
    if (name            !== undefined) expertUpdate.name            = name;
    if (bio             !== undefined) expertUpdate.bio             = bio;
    if (avatar          !== undefined) expertUpdate.avatar          = avatar;
    if (yearsExperience !== undefined) expertUpdate.yearsExperience = yearsExperience;
    if (hourlyRate      !== undefined) expertUpdate.hourlyRate      = hourlyRate;
    if (isAvailable     !== undefined) expertUpdate.isAvailable     = isAvailable;

    if (Object.keys(expertUpdate).length > 0) {
      await prisma.expert.update({ where: { id: session.expertId }, data: expertUpdate });
    }
  }

  return NextResponse.json({ ok: true });
}
