'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

interface Stats {
  totalUsers: number; totalExperts: number; totalConsultations: number; totalSubmissions: number;
  pendingVerifications: Array<{ id: string; name: string; email: string; domain?: { name: string }; createdAt: string }>;
  recentFlags: Array<{ id: string; eventType: string; severity: string; score: number; expertId: string; createdAt: string }>;
  domainStats: Array<{ id: string; name: string; icon: string; expertCount: number; _count: { consultations: number } }>;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin');
    if (res.ok) setStats(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function verify(expertId: string, verified: boolean) {
    setVerifying(expertId);
    await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expertId, verified }) });
    setVerifying(null);
    load();
  }

  if (!user) return <div className="p-8 text-center text-slate-400">Admin access required</div>;
  if (loading) return <div className="p-8 animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}</div>;
  if (!stats) return <div className="p-8 text-red-500">Failed to load admin data</div>;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Total Experts', value: stats.totalExperts, icon: '🧠', color: 'from-purple-500 to-purple-600' },
    { label: 'Consultations', value: stats.totalConsultations, icon: '❓', color: 'from-green-500 to-green-600' },
    { label: 'Submissions', value: stats.totalSubmissions, icon: '📝', color: 'from-amber-500 to-amber-600' },
  ];

  const SEVERITY_COLOR: Record<string, string> = { low: 'bg-slate-100 text-slate-600', medium: 'bg-amber-100 text-amber-700', high: 'bg-red-100 text-red-700', critical: 'bg-red-200 text-red-800' };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Platform overview and moderation</p>
        </div>
        <a
          href="/admin"
          style={{ background: 'var(--accent)', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          Open Full Admin Panel →
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl flex-shrink-0`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pending verifications */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            🔍 Pending Verifications
            {stats.pendingVerifications.length > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{stats.pendingVerifications.length}</span>
            )}
          </h2>
          {stats.pendingVerifications.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">All experts verified ✓</p>
          ) : (
            <div className="space-y-3">
              {stats.pendingVerifications.map(e => (
                <div key={e.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {e.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{e.name}</div>
                    <div className="text-xs text-slate-500 truncate">{e.email} · {e.domain?.name}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => verify(e.id, true)} disabled={verifying === e.id}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 disabled:opacity-60 transition-all">
                      ✓ Verify
                    </button>
                    <button onClick={() => verify(e.id, false)} disabled={verifying === e.id}
                      className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-60 transition-all">
                      ✗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent flags */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">🚩 Anti-Fraud Flags</h2>
          {stats.recentFlags.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No fraud flags 🎉</p>
          ) : (
            <div className="space-y-2">
              {stats.recentFlags.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className={`text-xs px-2 py-1 rounded-lg font-semibold flex-shrink-0 ${SEVERITY_COLOR[f.severity] ?? 'bg-slate-100 text-slate-600'}`}>{f.severity}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-700 truncate">{f.eventType.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-slate-400">Risk: {(f.score * 100).toFixed(0)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Domain stats */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">📊 Domain Statistics</h2>
        <div className="grid grid-cols-4 gap-3">
          {stats.domainStats.map(d => (
            <div key={d.id} className="p-3 bg-slate-50 rounded-xl text-center">
              <div className="text-2xl mb-1">{d.icon}</div>
              <div className="text-xs font-semibold text-slate-700 truncate">{d.name}</div>
              <div className="text-xs text-slate-500 mt-1">{d.expertCount} experts</div>
              <div className="text-xs text-slate-500">{d._count.consultations} questions</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
