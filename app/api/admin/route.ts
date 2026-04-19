import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { checkAdminCookie } from '@/lib/admin-auth';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function requireSession(req: NextRequest) {
  if (checkAdminCookie(req)) return { role: 'admin' };
  const session = await getSessionFromRequest(req);
  if (!session) return null;
  return session;
}

// ─── GET — dashboard overview ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Accept admin role, but also allow any logged-in user for demo purposes
    // (remove the role check below to enforce strict admin-only access)
    if (session.role !== 'admin') {
      // Demo mode: allow any authenticated user to view the dashboard
      // In production, uncomment the line below and remove this comment:
      // return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      totalUsers,
      totalExperts,
      totalConsultations,
      totalSubmissions,
      pendingVerifications,
      recentFlags,
      domains,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.expert.count(),
      prisma.consultation.count(),
      prisma.submission.count(),

      // Experts awaiting verification
      prisma.expert.findMany({
        where: { isVerified: false },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          yearsExperience: true,
          createdAt: true,
          domain: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Unresolved anti-fraud flags, most recent first
      prisma.antiFraudLog.findMany({
        where: { resolved: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          eventType: true,
          severity: true,
          score: true,
          action: true,
          details: true,
          createdAt: true,
          submissionId: true,
          userId: true,
          expertId: true,
        },
      }),

      // Domain-level aggregates
      prisma.domain.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          color: true,
          _count: {
            select: {
              experts: true,
              consultations: true,
            },
          },
        },
        where: { isActive: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const domainStats = domains.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      icon: d.icon,
      color: d.color,
      expertCount: d._count.experts,
      consultationCount: d._count.consultations,
    }));

    return NextResponse.json({
      totalUsers,
      totalExperts,
      totalConsultations,
      totalSubmissions,
      pendingVerifications,
      recentFlags,
      domainStats,
    });
  } catch (error) {
    console.error('[GET /api/admin]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── PATCH — verify / un-verify an expert ───────────────────────────────────

interface VerifyBody {
  expertId: string;
  verified: boolean;
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Strict: only admins may mutate verification status
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: VerifyBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { expertId, verified } = body;

    if (!expertId || typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'expertId (string) and verified (boolean) are required' },
        { status: 400 }
      );
    }

    const expert = await prisma.expert.findUnique({ where: { id: expertId } });
    if (!expert) {
      return NextResponse.json({ error: 'Expert not found' }, { status: 404 });
    }

    const updated = await prisma.expert.update({
      where: { id: expertId },
      data: { isVerified: verified },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        updatedAt: true,
      },
    });

    // Notify the expert of the verification decision
    await prisma.notification.create({
      data: {
        expertId,
        type: 'targeted',
        title: verified ? 'Account Verified!' : 'Verification Revoked',
        body: verified
          ? 'Congratulations! Your expert account has been verified by an administrator.'
          : 'Your expert verification status has been revoked. Please contact support.',
      },
    });

    return NextResponse.json({ expert: updated, ok: true });
  } catch (error) {
    console.error('[PATCH /api/admin]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
