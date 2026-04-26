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

const STAT_CONFIG = [
  { key: 'totalExperts',        icon: '👤', label: 'dash_experts'     },
  { key: 'totalDomains',        icon: '🗂️', label: 'dash_domains'     },
  { key: 'activeConsultations', icon: '⚡', label: 'dash_active'      },
  { key: 'totalSubmissions',    icon: '📄', label: 'dash_submissions' },
];

const STATUS_STYLE: Record<string, string> = {
  pending: 'badge-gray', analyzing: 'badge-blue', routing: 'badge-purple',
  active: 'badge-green', examining: 'badge-gold', completed: 'badge-green', cancelled: 'badge-red',
};

const STEP_ICONS = ['💬', '👥', '📚', '✅', '🧪', '🏆'];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!stats) return (
    <div className="p-8" style={{ color: '#a83230', fontFamily: 'Inter', fontSize: 14 }}>
      Failed to load stats
    </div>
  );

  const statValues: Record<string, number> = {
    totalExperts:        stats.totalExperts,
    totalDomains:        stats.totalDomains,
    activeConsultations: stats.activeConsultations,
    totalSubmissions:    stats.totalSubmissions,
  };

  const steps = [
    { title: t('step_ask'),     desc: t('step_ask_desc') },
    { title: t('step_ai'),      desc: t('step_ai_desc') },
    { title: t('step_experts'), desc: t('step_experts_desc') },
    { title: t('step_eval'),    desc: t('step_eval_desc') },
    { title: t('step_exam'),    desc: t('step_exam_desc') },
    { title: t('step_reward'),  desc: t('step_reward_desc') },
  ];

  return (
    <div className="p-8 space-y-10">
      {/* Hero heading */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight serif">{t('dash_title')}</h1>
        <p className="tag-editorial mt-3">{t('dash_subtitle')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {STAT_CONFIG.map((s, i) => (
          <motion.div key={s.key}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="editorial-card p-6">
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-3xl font-light serif mb-1">
              {statValues[s.key].toLocaleString()}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>
              {t(s.label as any)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top experts + Recent consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Experts */}
        <div className="editorial-card p-6 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2"
            style={{ color: 'var(--text-primary)', fontFamily: 'Inter' }}>
            <span>🏆</span> {t('dash_top_experts')}
          </h2>
          {stats.topExperts.map((expert, i) => (
            <div key={expert.id} className="flex items-center gap-3 py-3"
              style={{ borderBottom: i < stats.topExperts.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="w-8 h-8 flex items-center justify-center font-black text-xs flex-shrink-0 serif italic"
                style={{ background: i === 0 ? 'var(--accent)' : 'var(--text-primary)', color: 'var(--bg)' }}>
                {i < 3 ? ['I','II','III'][i] : `${i+1}`}
              </div>
              <div className="w-9 h-9 flex items-center justify-center font-bold text-sm flex-shrink-0 serif italic"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                {expert.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Inter' }}>{expert.name}</div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>
                  {expert.domain?.icon} {expert.domain?.name}
                </div>
              </div>
              <div className="text-sm font-bold italic serif" style={{ color: 'var(--accent)' }}>
                {expert.rating.toFixed(1)}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Consultations */}
        <div className="editorial-card p-6 space-y-3">
          <h2 className="font-bold text-base flex items-center gap-2"
            style={{ color: 'var(--text-primary)', fontFamily: 'Inter' }}>
            <span>⚡</span> {t('dash_recent')}
          </h2>
          {stats.recentConsultations.map(c => (
            <div key={c.id} className="py-3"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold line-clamp-1 flex-1 leading-snug"
                  style={{ color: 'var(--text-primary)', fontFamily: 'Inter' }}>{c.title}</p>
                <span className={STATUS_STYLE[c.status] ?? 'badge-gray'}>{c.status}</span>
              </div>
              {c.domain && (
                <div className="text-[10px] uppercase tracking-widest mt-1 font-bold"
                  style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{c.domain.name}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="editorial-card p-8">
        <h2 className="font-bold text-base mb-8" style={{ color: 'var(--text-primary)', fontFamily: 'Inter' }}>
          {t('dash_how')}
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 flex items-center justify-center text-xl"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  {STEP_ICONS[i]}
                </div>
                <div className="absolute -top-2 -end-2 w-5 h-5 flex items-center justify-center text-[9px] font-black"
                  style={{ background: 'var(--text-primary)', color: 'var(--bg)', fontFamily: 'Inter' }}>
                  {i + 1}
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider leading-tight"
                style={{ color: 'var(--text-primary)', fontFamily: 'Inter' }}>{s.title}</div>
              <div className="text-[10px] leading-snug" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <div className="h-16 skeleton w-64" />
      <div className="grid grid-cols-4 gap-5">{[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton" />)}</div>
      <div className="grid grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <div key={i} className="h-64 skeleton" />)}</div>
    </div>
  );
}
