'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

interface Stats {
  totalUsers: number; totalExperts: number; totalConsultations: number; totalSubmissions: number;
  pendingVerifications: Array<{ id: string; name: string; email: string; domain?: { name: string }; createdAt: string }>;
  recentFlags: Array<{ id: string; eventType: string; severity: string; score: number; expertId: string; createdAt: string }>;
  domainStats: Array<{ id: string; name: string; icon: string; expertCount: number; _count: { consultations: number } }>;
}

const SEVERITY_STYLE: Record<string, { bg: string; color: string }> = {
  low:      { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
  medium:   { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  high:     { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
  critical: { bg: 'rgba(220,38,38,0.15)',   color: '#ef4444' },
};

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
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expertId, verified }),
    });
    setVerifying(null);
    load();
  }

  if (!user) return (
    <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
      Admin access required
    </div>
  );
  if (loading) return (
    <div className="p-8 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 skeleton" />)}
    </div>
  );
  if (!stats) return (
    <div className="p-8" style={{ color: '#f87171' }}>Failed to load admin data</div>
  );

  const statCards = [
    { label: 'Total Users',     value: stats.totalUsers,         icon: '👥', gradFrom: '#3b82f6', gradTo: '#6366f1' },
    { label: 'Total Experts',   value: stats.totalExperts,       icon: '🧠', gradFrom: '#8b5cf6', gradTo: '#ec4899' },
    { label: 'Consultations',   value: stats.totalConsultations, icon: '❓', gradFrom: '#10b981', gradTo: '#34d399' },
    { label: 'Submissions',     value: stats.totalSubmissions,   icon: '📝', gradFrom: '#f59e0b', gradTo: '#fbbf24' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Admin Panel</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Platform overview and moderation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${s.gradFrom},${s.gradTo})` }}>
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending verifications */}
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            🔍 Pending Verifications
            {stats.pendingVerifications.length > 0 && (
              <span className="w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0"
                style={{ background: '#ef4444' }}>
                {stats.pendingVerifications.length}
              </span>
            )}
          </h2>
          {stats.pendingVerifications.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>All experts verified ✓</p>
          ) : (
            <div className="space-y-3">
              {stats.pendingVerifications.map(e => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {e.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{e.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {e.email} · {e.domain?.name}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => verify(e.id, true)} disabled={verifying === e.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
                      ✓ Verify
                    </button>
                    <button onClick={() => verify(e.id, false)} disabled={verifying === e.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60"
                      style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                      ✗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anti-fraud flags */}
        <div className="card">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>🚩 Anti-Fraud Flags</h2>
          {stats.recentFlags.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No fraud flags 🎉</p>
          ) : (
            <div className="space-y-2">
              {stats.recentFlags.map(f => {
                const sev = SEVERITY_STYLE[f.severity] ?? SEVERITY_STYLE.low;
                return (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <span className="text-xs px-2 py-1 rounded-lg font-semibold flex-shrink-0 capitalize"
                      style={{ background: sev.bg, color: sev.color }}>
                      {f.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate capitalize" style={{ color: 'var(--text-primary)' }}>
                        {f.eventType.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Risk: {(f.score * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Domain stats */}
      {stats.domainStats.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>📊 Domain Statistics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.domainStats.map(d => (
              <div key={d.id} className="p-3 rounded-xl text-center"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="text-2xl mb-1">{d.icon}</div>
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{d.name}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{d.expertCount} experts</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d._count.consultations} questions</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
