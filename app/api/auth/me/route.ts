import { NextRequest, NextResponse } from 'next/server';
import { getSession, signToken, cookieOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, bio: true, reputation: true, appLanguage: true, createdAt: true },
  });

  const expert = session.expertId
    ? await prisma.expert.findUnique({
        where: { id: session.expertId },
        include: { domain: true },
      })
    : null;

  const unreadNotifs = await prisma.notification.count({
    where: {
      ...(session.role === 'expert' ? { expertId: session.expertId } : { userId: session.id }),
      isRead: false,
    },
  });

  return NextResponse.json({ user, expert, session, unreadNotifications: unreadNotifs });
}

const UpdateSchema = z.object({
  name:            z.string().min(2).max(100).optional(),
  bio:             z.string().max(500).optional(),
  appLanguage:     z.enum(['en', 'ar', 'ku']).optional(),
  currentPassword: z.string().optional(),
  newPassword:     z.string().min(6).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  let data: z.infer<typeof UpdateSchema>;
  try { data = UpdateSchema.parse(body); }
  catch (err) { return NextResponse.json({ error: String(err) }, { status: 422 }); }

  // Password change flow
  if (data.currentPassword && data.newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user?.passwordHash) return NextResponse.json({ error: 'No password set' }, { status: 400 });

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });

    const newHash = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({ where: { id: session.id }, data: { passwordHash: newHash } });
    return NextResponse.json({ message: 'Password updated successfully' });
  }

  // Profile update
  const updateData: Record<string, unknown> = {};
  if (data.name) updateData.name = data.name;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.appLanguage) updateData.appLanguage = data.appLanguage;

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, bio: true, appLanguage: true },
  });

  // Refresh JWT with new name/language
  const newToken = await signToken({
    id: session.id,
    email: session.email,
    name: updated.name,
    role: session.role,
    expertId: session.expertId,
    appLanguage: updated.appLanguage,
  });

  const res = NextResponse.json({ user: updated });
  res.cookies.set(cookieOptions(newToken));
  return res;
}
