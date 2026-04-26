export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [
    totalExperts,
    totalConsultations,
    totalDomains,
    activeConsultations,
    completedConsultations,
    totalSubmissions,
    topExperts,
    recentConsultations,
  ] = await Promise.all([
    prisma.expert.count(),
    prisma.consultation.count(),
    prisma.domain.count(),
    prisma.consultation.count({ where: { status: 'active' } }),
    prisma.consultation.count({ where: { status: 'completed' } }),
    prisma.submission.count(),
    prisma.expert.findMany({
      orderBy: { rating: 'desc' },
      take: 5,
      include: { domain: true },
    }),
    prisma.consultation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { domain: true, user: { select: { name: true } } },
    }),
  ]);

  return NextResponse.json({
    totalExperts,
    totalConsultations,
    totalDomains,
    activeConsultations,
    completedConsultations,
    totalSubmissions,
    topExperts,
    recentConsultations,
  });
}
