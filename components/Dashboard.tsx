'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

interface Stats {
  totalExperts: number; totalConsultations: number; totalDomains: number;
  activeConsultations: number; completedConsultations: number; totalSubmissions: number;
  topExperts: Array<{ id: string; name: string; rating: number; domain?: { name: string; icon: string } }>;
  recentConsultations: Array<{ id: string; title: string; status: string; domain?: { name: string; color: string }; user: { name: string } }>;
}

const STAT_CONFIG = [
  { key: 'totalExperts',        gradFrom: '#c2714f', gradTo: '#d4a853', glow: 'rgba(194,113,79,0.3)',
    icon: <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/> },
  { key: 'totalDomains',        gradFrom: '#8b4513', gradTo: '#c2714f', glow: 'rgba(139,69,19,0.3)',
    icon: <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/> },
  { key: 'activeConsultations', gradFrom: '#10b981', gradTo: '#34d399', glow: 'rgba(52,211,153,0.3)',
    icon: <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/> },
  { key: 'totalSubmissions',    gradFrom: '#f59e0b', gradTo: '#fbbf24', glow: 'rgba(251,191,36,0.3)',
    icon: <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/> },
];

const STEP_ICONS = [
  { grad: ['#c2714f','#d4a853'], icon: <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/> },
  { grad: ['#38bdf8','#c2714f'], icon: <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/> },
  { grad: ['#8b4513','#c2714f'], icon: <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/> },
  { grad: ['#10b981','#38bdf8'], icon: <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/> },
  { grad: ['#f59e0b','#f97316'], icon: <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/> },
  { grad: ['#d4a853','#f0c97a'], icon: <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/> },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  pending:   { bg: 'rgba(148,163,184,0.1)',  color: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
  analyzing: { bg: 'rgba(56,189,248,0.1)',   color: '#38bdf8', border: 'rgba(56,189,248,0.2)' },
  routing:   { bg: 'rgba(194,113,79,0.1)',   color: '#c2714f', border: 'rgba(194,113,79,0.2)' },
  active:    { bg: 'rgba(52,211,153,0.1)',   color: '#34d399', border: 'rgba(52,211,153,0.2)' },
  examining: { bg: 'rgba(251,191,36,0.1)',   color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
  completed: { bg: 'rgba(52,211,153,0.1)',   color: '#34d399', border: 'rgba(52,211,153,0.2)' },
  cancelled: { bg: 'rgba(248,113,113,0.1)',  color: '#f87171', border: 'rgba(248,113,113,0.2)' },
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!stats) return <div className="p-8" style={{ color: '#f87171' }}>{t('dash_load_error')}</div>;

  const statValues: Record<string, number> = {
    totalExperts:        stats.totalExperts,
    totalDomains:        stats.totalDomains,
    activeConsultations: stats.activeConsultations,
    totalSubmissions:    stats.totalSubmissions,
  };
  const statLabels: Record<string, string> = {
    totalExperts:        t('dash_experts'),
    totalDomains:        t('dash_domains'),
    activeConsultations: t('dash_active'),
    totalSubmissions:    t('dash_submissions'),
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
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Hero heading */}
      <div>
        <h1 className="text-3xl font-black tracking-tight gradient-text">{t('dash_title')}</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{t('dash_subtitle')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CONFIG.map((s, i) => (
          <div key={s.key} className="card flex items-center gap-4 overflow-hidden"
            style={{ animationDelay: `${i * 60}ms` }}>
            {/* Glow accent line */}
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${s.gradFrom}55,transparent)` }} />
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${s.gradFrom},${s.gradTo})`, boxShadow: `0 4px 16px ${s.glow}` }}>
              <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">{s.icon}</svg>
            </div>
            <div>
              <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                {statValues[s.key].toLocaleString()}
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {statLabels[s.key]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top experts + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <h2 className="font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#d4a853,#f0c97a)', boxShadow: '0 4px 12px rgba(212,168,83,0.3)' }}>
              🏆
            </span>
            {t('dash_top_experts')}
          </h2>
          {stats.topExperts.map((expert, i) => (
            <div key={expert.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={{ background: i === 0 ? 'rgba(251,191,36,0.06)' : 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                style={{ background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : i === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : i === 2 ? 'linear-gradient(135deg,#f97316,#fb923c)' : 'var(--surface)' }}>
                {i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}`}
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#c2714f,#d4a853)' }}>
                {expert.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{expert.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{expert.domain?.icon} {expert.domain?.name}</div>
              </div>
              <div className="text-sm font-black" style={{ color: '#d4a853' }}>⭐ {expert.rating.toFixed(1)}</div>
            </div>
          ))}
        </div>

        <div className="card space-y-3">
          <h2 className="font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', boxShadow: '0 4px 12px rgba(52,211,153,0.3)' }}>
              ⚡
            </span>
            {t('dash_recent')}
          </h2>
          {stats.recentConsultations.map(c => {
            const s = STATUS_STYLE[c.status] ?? STATUS_STYLE.pending;
            return (
              <div key={c.id} className="px-3 py-2.5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium line-clamp-1 flex-1" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-lg font-semibold flex-shrink-0"
                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                    {c.status}
                  </span>
                </div>
                {c.domain && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{c.domain.name}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="card">
        <h2 className="font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{t('dash_how')}</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
                style={{ background: `linear-gradient(135deg,${STEP_ICONS[i].grad[0]},${STEP_ICONS[i].grad[1]})`,
                         boxShadow: `0 4px 16px ${STEP_ICONS[i].grad[0]}44` }}>
                <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">{STEP_ICONS[i].icon}</svg>
                <div className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: 'var(--surface)', border: '2px solid var(--bg)', color: STEP_ICONS[i].grad[0] }}>
                  {i+1}
                </div>
              </div>
              <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
              <div className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-6">
      <div className="h-9 w-56 skeleton" />
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton" />)}</div>
      <div className="grid grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <div key={i} className="h-64 skeleton" />)}</div>
    </div>
  );
}
