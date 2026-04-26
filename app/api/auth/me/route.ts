export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
