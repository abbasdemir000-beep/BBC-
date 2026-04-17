'use client';
import { useEffect, useState } from 'react';

interface Stats {
  totalExperts: number;
  totalConsultations: number;
  totalDomains: number;
  activeConsultations: number;
  completedConsultations: number;
  totalSubmissions: number;
  topExperts: Array<{ id: string; name: string; rating: number; domain?: { name: string; icon: string } }>;
  recentConsultations: Array<{ id: string; title: string; status: string; domain?: { name: string; color: string }; user: { name: string } }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'badge-gray',
  analyzing: 'badge-blue',
  routing:   'badge-purple',
  active:    'badge-green',
  examining: 'badge-gold',
  completed: 'badge-green',
  cancelled: 'badge-red',
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!stats) return <div className="p-8 text-red-500">Failed to load stats</div>;

  const statCards = [
    { label: 'Total Experts',      value: stats.totalExperts,       icon: '🧠', color: 'from-blue-500 to-blue-600' },
    { label: 'Domains',            value: stats.totalDomains,       icon: '📚', color: 'from-purple-500 to-purple-600' },
    { label: 'Active Competitions',value: stats.activeConsultations,icon: '⚡', color: 'from-green-500 to-green-600' },
    { label: 'Total Submissions',  value: stats.totalSubmissions,   icon: '📝', color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">AI-powered knowledge competition platform</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow-sm`}>
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{s.value.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Experts */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span>🏆</span> Top Experts
          </h2>
          <div className="space-y-3">
            {stats.topExperts.map((expert, i) => (
              <div key={expert.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                  {i + 1}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {expert.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{expert.name}</div>
                  <div className="text-xs text-slate-500">{expert.domain?.icon} {expert.domain?.name}</div>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                  ⭐ {expert.rating.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Competitions */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span>⚡</span> Recent Competitions
          </h2>
          <div className="space-y-3">
            {stats.recentConsultations.map(c => (
              <div key={c.id} className="p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 flex-1">{c.title}</p>
                  <span className={STATUS_COLORS[c.status] || 'badge-gray'}>{c.status}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  {c.domain && (
                    <span className="text-xs text-slate-500">{c.domain.name}</span>
                  )}
                  <span className="text-xs text-slate-400">by {c.user.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-6">How It Works</h2>
        <div className="grid grid-cols-6 gap-4">
          {[
            { step: '1', icon: '❓', title: 'Ask', desc: 'Submit your question or problem' },
            { step: '2', icon: '🤖', title: 'AI Analysis', desc: 'AI classifies and routes to experts' },
            { step: '3', icon: '👥', title: 'Experts Answer', desc: 'Top matched experts compete' },
            { step: '4', icon: '🔍', title: 'AI Evaluation', desc: 'Accuracy, reasoning, completeness scored' },
            { step: '5', icon: '📝', title: 'Mini Exam', desc: 'Experts prove deep understanding' },
            { step: '6', icon: '🏆', title: 'Winner & Reward', desc: 'Best answer wins points' },
          ].map(s => (
            <div key={s.step} className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-2xl shadow-sm">{s.icon}</div>
              <div className="text-xs font-bold text-slate-700">{s.title}</div>
              <div className="text-xs text-slate-500 leading-tight">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-slate-200 rounded-2xl" />)}
      </div>
    </div>
  );
}
