import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const room = await prisma.chatRoom.findUnique({
    where: { id: params.roomId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

  if (!room) return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });

  const isParticipant =
    (session.role === 'expert' && room.expertId === session.expertId) ||
    (session.role !== 'expert' && room.userId === session.id);

  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Mark messages from other party as read
  await prisma.message.updateMany({
    where: {
      chatRoomId: params.roomId,
      senderRole: session.role === 'expert' ? 'user' : 'expert',
      isRead: false,
    },
    data: { isRead: true },
  });

  return NextResponse.json({ messages: room.messages, room });
}

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const room = await prisma.chatRoom.findUnique({ where: { id: params.roomId } });
  if (!room || !room.isActive) return NextResponse.json({ error: 'Chat room not available' }, { status: 404 });

  const isParticipant =
    (session.role === 'expert' && room.expertId === session.expertId) ||
    (session.role !== 'expert' && room.userId === session.id);

  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { content } = await req.json() as { content: string };
  if (!content?.trim()) return NextResponse.json({ error: 'Message content required' }, { status: 400 });

  const message = await prisma.message.create({
    data: {
      chatRoomId: params.roomId,
      senderId: session.id,
      senderRole: session.role === 'expert' ? 'expert' : 'user',
      senderName: session.name,
      content: content.trim(),
    },
  });

  return NextResponse.json({ message });
}
