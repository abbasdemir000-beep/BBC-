import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim();
    const type = searchParams.get('type') ?? 'all'; // experts | consultations | all
    const domain = searchParams.get('domain') ?? undefined; // optional domain slug

    if (!q) {
      return NextResponse.json(
        { experts: [], consultations: [], total: 0 },
        { status: 200 }
      );
    }

    const searchExperts = type === 'all' || type === 'experts';
    const searchConsultations = type === 'all' || type === 'consultations';

    const [experts, consultations] = await Promise.all([
      searchExperts
        ? prisma.expert.findMany({
            where: {
              AND: [
                {
                  OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { bio: { contains: q, mode: 'insensitive' } },
                  ],
                },
                ...(domain
                  ? [{ domain: { slug: domain } }]
                  : []),
              ],
            },
            include: {
              domain: {
                select: { id: true, name: true, slug: true, icon: true, color: true },
              },
              subDomain: {
                select: { id: true, name: true, slug: true },
              },
            },
            orderBy: { rating: 'desc' },
            take: 20,
          })
        : Promise.resolve([]),

      searchConsultations
        ? prisma.consultation.findMany({
            where: {
              AND: [
                { status: 'active' },
                {
                  OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                  ],
                },
                ...(domain
                  ? [{ domain: { slug: domain } }]
                  : []),
              ],
            },
            include: {
              domain: {
                select: { id: true, name: true, slug: true, icon: true, color: true },
              },
              subDomain: {
                select: { id: true, name: true, slug: true },
              },
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
          })
        : Promise.resolve([]),
    ]);

    const total = experts.length + consultations.length;

    return NextResponse.json({ experts, consultations, total });
  } catch (error) {
    console.error('[GET /api/search]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
