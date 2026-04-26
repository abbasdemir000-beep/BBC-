'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';
import { motion } from 'framer-motion';

interface Stats {
  totalExperts: number; totalConsultations: number; totalDomains: number;
  activeConsultations: number; completedConsultations: number; totalSubmissions: number;
  topExperts: Array<{ id: string; name: string; rating: number; domain?: { name: string; icon: string } }>;
  recentConsultations: Array<{ id: string; title: string; status: string; urgency?: string; prizePoints?: number; domain?: { name: string; color: string }; user: { name: string } }>;
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'badge-gray', analyzing: 'badge-blue', routing: 'badge-purple',
  active: 'badge-green', examining: 'badge-gold', completed: 'badge-green', cancelled: 'badge-red',
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!stats) return <div style={{ color: '#a83230' }}>Failed to load stats</div>;

  const statCards = [
    { label: t('dash_experts'),     value: stats.totalExperts.toLocaleString()        },
    { label: t('dash_domains'),     value: stats.totalDomains.toLocaleString()         },
    { label: t('dash_active'),      value: stats.activeConsultations.toLocaleString() },
    { label: t('dash_submissions'), value: stats.totalSubmissions.toLocaleString()    },
  ];

  const featured = stats.recentConsultations[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
      {/* ── Featured Column ── */}
      <div className="md:col-span-7 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-baseline flex-wrap mb-10 gap-3">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-tight serif">
              {featured ? (
                <>
                  {featured.title.split(' ').slice(0,2).join(' ')}<br />
                  <span className="italic font-light">{featured.title.split(' ').slice(2,4).join(' ')}</span><br />
                  {featured.title.split(' ').slice(4).join(' ')}
                </>
              ) : (
                <>Knowledge <br /><span className="italic">Intelligence</span><br />Marketplace</>
              )}
            </h1>
            <p className="tag-editorial mt-3">{t('dash_title')}</p>
          </div>
        </div>

        {/* Featured Consultation Card */}
        {featured && (
          <div className="editorial-card p-10 relative mb-10">
            <div className="flex justify-between items-center mb-8 pb-4"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-[11px] font-bold uppercase tracking-tight font-sans"
                style={{ opacity: 0.45 }}>
                Bounty ID: {featured.id.slice(0, 8).toUpperCase()}
              </span>
              {featured.prizePoints && (
                <span className="text-3xl font-bold italic serif">${featured.prizePoints}</span>
              )}
            </div>
            <p className="text-xl leading-relaxed mb-8 serif" style={{ opacity: 0.75, fontStyle: 'italic' }}>
              {featured.title}
            </p>
            {featured.domain && (
              <p className="tag-editorial mb-8">{featured.domain.name}</p>
            )}
            <button className="btn-editorial">
              {t('step_ask')} →
            </button>
          </div>
        )}

        {/* Stats grid */}
        <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-8"
          style={{ borderTop: '1px solid var(--border)', paddingTop: 32 }}>
          {statCards.map(s => (
            <div key={s.label}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2 font-sans"
                style={{ opacity: 0.4 }}>{s.label}</div>
              <div className="text-3xl font-light serif">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Side Column: Active Bounties ── */}
      <div className="md:col-span-5 flex flex-col md:pl-10"
        style={{ borderLeft: '1px solid var(--border)' }}>
        <div className="mb-8 flex justify-between items-end">
          <h2 className="text-2xl font-light italic uppercase tracking-tight serif">
            Active Bounties
          </h2>
          <span className="text-[10px] underline cursor-pointer font-bold uppercase tracking-widest font-sans"
            style={{ opacity: 0.45 }}>
            {t('dash_recent')}
          </span>
        </div>

        <div className="space-y-0">
          {stats.recentConsultations.map(c => (
            <motion.div key={c.id} whileHover={{ x: 4 }}
              className="flex justify-between items-center py-5 group cursor-pointer"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="pr-4 flex-1 min-w-0">
                <div className="font-bold text-base leading-tight line-clamp-2 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}>
                  {c.title}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest mt-2 font-sans flex items-center gap-2"
                  style={{ opacity: 0.4 }}>
                  {c.domain?.name}
                  <span className={STATUS_STYLE[c.status] ?? 'badge-gray'}>{c.status}</span>
                </div>
              </div>
              {c.prizePoints && (
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold italic serif">${c.prizePoints}</div>
                  {c.urgency && (
                    <div className="text-[9px] font-bold uppercase tracking-tight mt-1 font-sans"
                      style={{ color: c.urgency === 'critical' || c.urgency === 'high' ? '#a83230' : '#2d7a50' }}>
                      {c.urgency}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
          {stats.recentConsultations.length === 0 && (
            <p className="text-sm italic serif py-8" style={{ opacity: 0.4 }}>No active bounties.</p>
          )}
        </div>

        {/* Top Experts / Account Standing */}
        <div className="mt-10 p-8" style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
          <div className="text-[10px] uppercase tracking-widest font-bold mb-3 font-sans" style={{ opacity: 0.55 }}>
            {t('dash_top_experts')}
          </div>
          <div className="space-y-3">
            {stats.topExperts.slice(0, 3).map((e, i) => (
              <div key={e.id} className="flex items-center justify-between"
                style={{ borderBottom: i < 2 ? '1px solid rgba(249,247,242,0.1)' : 'none', paddingBottom: i < 2 ? 12 : 0 }}>
                <div>
                  <div className="font-bold text-sm">{e.name}</div>
                  <div className="text-[10px] uppercase tracking-widest font-sans mt-0.5" style={{ opacity: 0.5 }}>
                    {e.domain?.icon} {e.domain?.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-light italic serif">{e.rating.toFixed(1)}</div>
                  <div className="text-[9px] uppercase font-bold tracking-widest font-sans" style={{ opacity: 0.5 }}>
                    Rating
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
      <div className="md:col-span-7 space-y-6">
        <div className="h-40 skeleton" />
        <div className="h-52 skeleton" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div>
      </div>
      <div className="md:col-span-5 space-y-4">
        <div className="h-8 skeleton w-40" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}
      </div>
    </div>
  );
}
