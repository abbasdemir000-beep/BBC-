import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

const MIN_WITHDRAWAL_POINTS = 1000;

type WithdrawMethod = 'paypal' | 'bank';

interface WithdrawBody {
  amount: number;
  method: WithdrawMethod;
  details: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: WithdrawBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { amount, method, details } = body;

    // ── Validate amount ──────────────────────────────────────────────────────
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number' },
        { status: 400 }
      );
    }

    if (amount < MIN_WITHDRAWAL_POINTS) {
      return NextResponse.json(
        {
          error: `Minimum withdrawal amount is ${MIN_WITHDRAWAL_POINTS} points`,
          minimum: MIN_WITHDRAWAL_POINTS,
        },
        { status: 400 }
      );
    }

    // ── Validate method ──────────────────────────────────────────────────────
    const allowedMethods: WithdrawMethod[] = ['paypal', 'bank'];
    if (!allowedMethods.includes(method)) {
      return NextResponse.json(
        { error: `method must be one of: ${allowedMethods.join(', ')}` },
        { status: 400 }
      );
    }

    // ── Validate details ─────────────────────────────────────────────────────
    if (!details || typeof details !== 'string' || details.trim().length === 0) {
      return NextResponse.json(
        { error: 'details is required' },
        { status: 400 }
      );
    }

    // ── Check available reward points balance ────────────────────────────────
    const balanceResult = await prisma.reward.aggregate({
      where: {
        status: 'available',
        OR: [
          { userId: session.id },
          ...(session.expertId ? [{ expertId: session.expertId }] : []),
        ],
      },
      _sum: { points: true },
    });
    const available = balanceResult._sum.points ?? 0;

    if (available < amount) {
      return NextResponse.json(
        { error: 'Insufficient points', available, requested: amount },
        { status: 422 }
      );
    }

    // Deduct by marking oldest available rewards as claimed
    const rewardsList = await prisma.reward.findMany({
      where: {
        status: 'available',
        OR: [
          { userId: session.id },
          ...(session.expertId ? [{ expertId: session.expertId }] : []),
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    let remaining = amount;
    for (const reward of rewardsList) {
      if (remaining <= 0) break;
      if (reward.points <= remaining) {
        await prisma.reward.update({ where: { id: reward.id }, data: { status: 'claimed', claimedAt: new Date() } });
        remaining -= reward.points;
      } else {
        await prisma.reward.update({ where: { id: reward.id }, data: { points: reward.points - remaining } });
        remaining = 0;
      }
    }

    // ── Create confirmation notification ────────────────────────────────────
    const message = `Withdrawal request of ${amount} points received. Processing in 3-5 business days.`;

    await prisma.notification.create({
      data: {
        userId: session.id,
        type: 'targeted',
        title: 'Withdrawal Request Received',
        body: message,
      },
    });

    return NextResponse.json({
      ok: true,
      message,
    });
  } catch (error) {
    console.error('[POST /api/withdraw]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
