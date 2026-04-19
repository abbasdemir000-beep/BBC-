import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, cookieOptions } from '@/lib/auth';
import { smartEmbedding } from '@/lib/ai/smartEngine';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const Schema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(['user', 'expert']).default('user'),
  appLanguage: z.enum(['en', 'ar', 'ku']).default('en'),
  // Expert-only fields
  bio:            z.string().optional(),
  domainSlug:     z.string().optional(),
  yearsExperience:z.number().min(0).max(60).optional(),
  examLanguage:   z.enum(['en', 'ar', 'ku']).default('en'),
  textLanguages:  z.array(z.enum(['en', 'ar', 'ku'])).default(['en']),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  let data: z.infer<typeof Schema>;
  try { data = Schema.parse(body); }
  catch (e) {
    const msg = e instanceof z.ZodError ? e.issues.map(i => i.message).join('; ') : 'Invalid request';
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      bio: data.bio,
      appLanguage: data.appLanguage,
    },
  });

  let expertId: string | undefined;

  if (data.role === 'expert') {
    const domain = data.domainSlug
      ? await prisma.domain.findUnique({ where: { slug: data.domainSlug } })
      : null;

    const expert = await prisma.expert.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        bio: data.bio ?? 'Expert on this platform',
        yearsExperience: data.yearsExperience ?? 0,
        domainId: domain?.id ?? null,
        isAvailable: true,
        isVerified: false,
        examLanguage: data.examLanguage,
        textLanguages: JSON.stringify(data.textLanguages),
        embeddingVector: JSON.stringify(
          smartEmbedding(`${data.bio ?? ''} ${domain?.name ?? data.domainSlug ?? ''} ${data.textLanguages.join(' ')}`)
        ),
      },
    });
    expertId = expert.id;
  }

  const token = await signToken({
    id: user.id, email: user.email, name: user.name,
    role: user.role as 'user' | 'expert',
    expertId,
    appLanguage: data.appLanguage,
  });

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    expertId,
  }, { status: 201 });

  res.cookies.set(cookieOptions(token));
  return res;
}
