export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { pointsToUSD } from '@/lib/utils';

const ClaimSchema = z.object({
  expertId: z.string(),
  rewardId: z.string(),
  adWatched: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const expertId = searchParams.get('expertId');
  const userId = searchParams.get('userId');

  const rewards = await prisma.reward.findMany({
    where: {
      ...(expertId ? { expertId } : {}),
      ...(userId ? { userId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const totalPoints = rewards
    .filter(r => r.status === 'available' || r.status === 'claimed')
    .reduce((sum, r) => sum + r.points, 0);

  return NextResponse.json({ rewards, totalPoints, moneyValue: pointsToUSD(totalPoints) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = ClaimSchema.parse(body);

  const reward = await prisma.reward.findFirst({
    where: { id: data.rewardId, expertId: data.expertId, status: 'available' },
  });
  if (!reward) return NextResponse.json({ error: 'Reward not found or already claimed' }, { status: 404 });

  // Require ad if > 500 points
  if (reward.points > 500 && !data.adWatched) {
    return NextResponse.json({ requiresAd: true, message: 'Watch a rewarded ad to claim this reward' });
  }

  const updated = await prisma.reward.update({
    where: { id: data.rewardId },
    data: { status: 'claimed', claimedAt: new Date() },
  });

  return NextResponse.json({ reward: updated, moneyValue: pointsToUSD(updated.points) });
}
