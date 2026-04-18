import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, cookieOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const Schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  let data: z.infer<typeof Schema>;
  try { data = Schema.parse(body); }
  catch (e) { return NextResponse.json({ error: String(e) }, { status: 422 }); }

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

  // Update last seen
  await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });

  // Check if user has expert profile
  const expert = user.role === 'expert'
    ? await prisma.expert.findUnique({ where: { email: user.email } })
    : null;

  const token = await signToken({
    id: user.id, email: user.email, name: user.name,
    role: user.role as 'user' | 'expert',
    expertId: expert?.id,
  });

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    expertId: expert?.id,
  });
  res.cookies.set(cookieOptions(token));
  return res;
}
