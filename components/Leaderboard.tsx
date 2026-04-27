'use client';
import { useEffect, useState } from 'react';

interface Expert {
  id: string; name: string; rating: number; totalReviews: number;
  totalWins: number; winRate: number; yearsExperience: number;
  isVerified: boolean; domain?: { name: string; icon: string; color: string };
}
interface TopUser {
  id: string; name: string; reputation: number;
  _count: { consultations: number };
}

const MEDALS = ['🥇', '🥈', '🥉'];
const RANK_GRADS = [
  'linear-gradient(135deg,#f59e0b,#fbbf24)',
  'linear-gradient(135deg,#94a3b8,#64748b)',
  'linear-gradient(135deg,#f97316,#fb923c)',
];

export default function Leaderboard() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [users, setUsers] = useState<TopUser[]>([]);
  const [tab, setTab] = useState<'experts' | 'users'>('experts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/stats?leaderboard=users').then(r => r.json()),
    ]).then(([stats, userStats]) => {
      setExperts(stats.topExperts ?? []);
      setUsers(userStats.topUsers ?? stats.topUsers ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Leaderboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Top performers on the platform</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        {(['experts', 'users'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={tab === t ? {
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            } : {
              color: 'var(--text-muted)',
            }}>
            {t === 'experts' ? '🧠 Top Experts' : '👥 Top Users'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 skeleton" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {tab === 'experts' && (
            experts.length === 0 ? (
              <div className="card text-center py-12" style={{ color: 'var(--text-muted)' }}>
                <div className="text-4xl mb-2">🧠</div>
                <p className="font-medium">No experts yet</p>
                <p className="text-sm mt-1">Register as an expert to appear here</p>
              </div>
            ) : experts.map((e, i) => (
              <div key={e.id} className="card flex items-center gap-4 transition-all"
                style={i < 3 ? { border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.03)' } : {}}>
                {/* Rank */}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                  style={{ background: RANK_GRADS[i] ?? 'var(--surface-2)', color: i >= 3 ? 'var(--text-secondary)' : undefined }}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </div>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {e.name.charAt(0)}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{e.name}</span>
                    {e.isVerified && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                        style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>✓ Verified</span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {e.domain?.icon} {e.domain?.name} · {e.yearsExperience} yrs · {e.totalWins} wins
                  </div>
                </div>
                {/* Rating */}
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-black" style={{ color: '#fbbf24' }}>⭐ {e.rating.toFixed(1)}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.totalReviews} reviews</div>
                </div>
              </div>
            ))
          )}

          {tab === 'users' && (
            users.length === 0 ? (
              <div className="card text-center py-12" style={{ color: 'var(--text-muted)' }}>
                <div className="text-4xl mb-2">👥</div>
                <p className="font-medium">User leaderboard coming soon</p>
                <p className="text-sm mt-1">Ask questions to earn reputation points!</p>
              </div>
            ) : users.map((u, i) => (
              <div key={u.id} className="card flex items-center gap-4 transition-all"
                style={i < 3 ? { border: '1px solid rgba(99,102,241,0.25)' } : {}}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                  style={{ background: RANK_GRADS[i] ?? 'var(--surface-2)' }}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </div>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#38bdf8,#6366f1)' }}>
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {u._count?.consultations ?? 0} questions asked
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-black" style={{ color: 'var(--accent)' }}>
                    {u.reputation.toLocaleString()}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>reputation</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
