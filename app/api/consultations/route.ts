export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5),
  imageUrl: z.string().url().optional(),
  urgency: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  isPublic: z.boolean().default(true),
  userId: z.string().optional(),
  language: z.string().default('en'),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const domain = searchParams.get('domain');
  const userId = searchParams.get('userId');

  const where = {
    ...(status ? { status } : {}),
    ...(domain ? { domain: { slug: domain } } : {}),
    ...(userId ? { userId } : {}),
  };

  const [consultations, total] = await Promise.all([
    prisma.consultation.findMany({
      where,
      include: {
        domain: true,
        subDomain: true,
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { submissions: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.consultation.count({ where }),
  ]);

  return NextResponse.json({ consultations, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  let data;
  try {
    data = CreateSchema.parse(body);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 422 });
  }

  // Use demo user if userId not provided
  let userId = data.userId;
  if (!userId) {
    const demoUser = await prisma.user.findFirst({ where: { email: 'demo@marketplace.com' } });
    userId = demoUser?.id;
  }
  if (!userId) return NextResponse.json({ error: 'User required' }, { status: 400 });

  const consultation = await prisma.consultation.create({
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      urgency: data.urgency,
      isPublic: data.isPublic,
      language: data.language,
      status: 'pending',
      userId,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json(consultation, { status: 201 });
}
