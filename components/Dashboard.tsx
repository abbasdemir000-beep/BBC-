'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

interface Stats {
  totalExperts: number; totalConsultations: number; totalDomains: number;
  activeConsultations: number; completedConsultations: number; totalSubmissions: number;
  topExperts: Array<{ id: string; name: string; rating: number; domain?: { name: string; icon: string } }>;
  recentConsultations: Array<{ id: string; title: string; status: string; domain?: { name: string; color: string }; user: { name: string } }>;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', analyzing: 'Analyzing', routing: 'Routing',
  active: 'Active', examining: 'Examining', completed: 'Completed', cancelled: 'Cancelled',
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!stats)  return <div className="p-12 text-center" style={{ color: 'var(--ink-muted)' }}>Failed to load stats.</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 animate-fade-in">

      {/* Hero */}
      <div className="mb-14 max-w-2xl">
        <p className="tag-editorial mb-3">Knowledge · Commerce · AI</p>
        <h1 className="font-display text-5xl font-light italic leading-tight mb-4" style={{ color: 'var(--ink)' }}>
          {t('dash_title')}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
          Ask a question, compete with verified experts, earn rewards — all powered by AI.
        </p>
      </div>

      {/* 7/5 two-col grid */}
      <div className="grid grid-cols-12" style={{ border: '1px solid var(--border-subtle)' }}>

        {/* LEFT col — 7 */}
        <div className="col-span-12 md:col-span-7" style={{ borderRight: '1px solid var(--border-subtle)' }}>

          {/* Stat strip */}
          <div className="grid grid-cols-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {[
              { label: t('dash_experts'),     value: stats.totalExperts },
              { label: t('dash_domains'),     value: stats.totalDomains },
              { label: t('dash_active'),      value: stats.activeConsultations },
              { label: t('dash_submissions'), value: stats.totalSubmissions },
            ].map((s, i) => (
              <div key={s.label} className="px-5 py-5"
                style={{ borderRight: i < 3 ? '1px solid var(--border-subtle)' : undefined }}>
                <div className="font-display text-3xl font-normal italic mb-1" style={{ color: 'var(--ink)' }}>
                  {s.value.toLocaleString()}
                </div>
                <div className="section-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent consultations */}
          <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="section-label mb-5">Active Bounties</p>
            {stats.recentConsultations.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--ink-muted)' }}>No consultations yet.</p>
            ) : (
              stats.recentConsultations.map((c, i) => (
                <div key={c.id} className="flex items-start justify-between py-4 group cursor-pointer"
                  style={{ borderTop: i > 0 ? '1px solid var(--border-subtle)' : undefined }}>
                  <div className="flex-1 min-w-0 pe-6">
                    {c.domain && <span className="tag-editorial block mb-1">{c.domain.name}</span>}
                    <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--ink)' }}>
                      {c.title}
                    </p>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--ink-muted)' }}>by {c.user.name}</p>
                  </div>
                  <span className="badge-editorial flex-shrink-0 mt-1" style={{ color: 'var(--ink-muted)' }}>
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* How it works */}
          <div className="px-6 py-6">
            <p className="section-label mb-6">How It Works</p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { n: '01', title: t('step_ask'),     desc: t('step_ask_desc') },
                { n: '02', title: t('step_experts'), desc: t('step_experts_desc') },
                { n: '03', title: t('step_reward'),  desc: t('step_reward_desc') },
              ].map(s => (
                <div key={s.n}>
                  <div className="font-display text-2xl italic mb-2" style={{ color: 'var(--accent)' }}>{s.n}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--ink)' }}>{s.title}</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT col — 5 */}
        <div className="col-span-12 md:col-span-5 flex flex-col">
          <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="section-label">Top Experts</p>
          </div>
          <div className="flex-1">
            {stats.topExperts.length === 0 ? (
              <p className="px-6 py-12 text-sm text-center" style={{ color: 'var(--ink-muted)' }}>No experts yet.</p>
            ) : (
              stats.topExperts.map((e, i) => (
                <div key={e.id} className="flex items-center gap-4 px-6 py-4 group cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-sm font-semibold"
                    style={{
                      background: i === 0 ? 'var(--ink)' : 'var(--border-subtle)',
                      color:      i === 0 ? 'var(--paper)' : 'var(--ink)',
                    }}>
                    {e.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{e.name}</div>
                    {e.domain && <div className="tag-editorial mt-0.5">{e.domain.icon} {e.domain.name}</div>}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{e.rating.toFixed(1)}</div>
                    <div className="section-label" style={{ fontSize: '9px' }}>rating</div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Pull-quote */}
          <div className="px-6 py-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <blockquote className="font-display text-lg font-light italic mb-3 leading-snug" style={{ color: 'var(--ink)' }}>
              "The marketplace where knowledge meets accountability."
            </blockquote>
            <p className="section-label" style={{ color: 'var(--accent)' }}>— Nexus Manifesto</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="h-4 w-40 skeleton mb-4" />
      <div className="h-14 w-96 skeleton mb-3" />
      <div className="h-4 w-72 skeleton mb-14" />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 h-96 skeleton" />
        <div className="col-span-5 h-96 skeleton" />
      </div>
    </div>
  );
}
