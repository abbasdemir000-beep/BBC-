import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateSchema = z.object({
  name:            z.string().min(2).max(80).optional(),
  bio:             z.string().max(500).optional(),
  avatar:          z.string().url().optional().or(z.literal('')),
  // Expert-only fields
  yearsExperience: z.number().min(0).max(60).optional(),
  hourlyRate:      z.number().min(0).optional(),
  isAvailable:     z.boolean().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, bio: true, avatar: true, reputation: true, appLanguage: true, createdAt: true },
  });

  const expert = session.expertId
    ? await prisma.expert.findUnique({
        where: { id: session.expertId },
        include: { domain: { select: { id: true, name: true, icon: true, slug: true } } },
      })
    : null;

  const stats = {
    questions: await prisma.consultation.count({ where: { userId: session.id } }),
    answers:   expert ? await prisma.submission.count({ where: { expertId: session.expertId! } }) : 0,
    examPasses: expert ? await prisma.examResult.count({ where: { expertId: session.expertId!, score: { gte: 60 } } }) : 0,
  };

  return NextResponse.json({ user, expert, stats });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  let data: z.infer<typeof UpdateSchema>;
  try { data = UpdateSchema.parse(body); }
  catch (err) { return NextResponse.json({ error: String(err) }, { status: 422 }); }

  const { name, bio, avatar, yearsExperience, hourlyRate, isAvailable } = data;

  if (name !== undefined || bio !== undefined || avatar !== undefined) {
    await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar: avatar || null }),
      },
    });
  }

  if (session.expertId && (yearsExperience !== undefined || hourlyRate !== undefined || isAvailable !== undefined || bio !== undefined || avatar !== undefined || name !== undefined)) {
    await prisma.expert.update({
      where: { id: session.expertId },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar: avatar || null }),
        ...(yearsExperience !== undefined && { yearsExperience }),
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
