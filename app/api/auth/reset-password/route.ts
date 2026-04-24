import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, cookieOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { z } from 'zod';

const RequestSchema = z.object({ email: z.string().email() });
const ConfirmSchema = z.object({ token: z.string().min(32), password: z.string().min(8) });

// POST /api/auth/reset-password — request reset token
// POST /api/auth/reset-password?action=confirm — confirm reset with token + new password
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (action === 'confirm') {
    let data: z.infer<typeof ConfirmSchema>;
    try { data = ConfirmSchema.parse(await req.json()); }
    catch (e) { return NextResponse.json({ error: String(e) }, { status: 422 }); }

    const reset = await prisma.passwordReset.findUnique({ where: { token: data.token } });
    if (!reset || reset.usedAt || new Date() > reset.expiresAt) {
      return NextResponse.json({ error: 'Token invalid or expired' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: reset.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const passwordHash = await bcrypt.hash(data.password, 12);
    await Promise.all([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    ]);

    const expert = user.role === 'expert'
      ? await prisma.expert.findUnique({ where: { email: user.email } })
      : null;

    const token = await signToken({ id: user.id, email: user.email, name: user.name, role: user.role as 'user' | 'expert', expertId: expert?.id, appLanguage: user.appLanguage });
    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    res.cookies.set(cookieOptions(token));
    return res;
  }

  // Default: request reset
  let data: z.infer<typeof RequestSchema>;
  try { data = RequestSchema.parse(await req.json()); }
  catch (e) { return NextResponse.json({ error: String(e) }, { status: 422 }); }

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  // Always respond 200 to prevent email enumeration
  if (!user) return NextResponse.json({ ok: true });

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordReset.create({ data: { email: data.email, token, expiresAt } });

  // In production: send email with token. For now, return token in response (dev only).
  const isDev = process.env.NODE_ENV !== 'production';
  return NextResponse.json({ ok: true, ...(isDev ? { token } : {}) });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset || reset.usedAt || new Date() > reset.expiresAt) {
    return NextResponse.json({ valid: false });
  }
  return NextResponse.json({ valid: true, email: reset.email });
}
