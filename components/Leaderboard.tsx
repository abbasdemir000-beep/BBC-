'use client';
import { useEffect, useState } from 'react';

interface Expert { id: string; name: string; rating: number; totalReviews: number; yearsExperience: number; isVerified: boolean; domain?: { name: string; icon: string; color: string }; }

export default function Leaderboard() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [tab, setTab] = useState<'experts' | 'users'>('experts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(stats => {
      setExperts(stats.topExperts ?? []);
      setLoading(false);
    });
  }, []);

  const MEDALS = ['🥇', '🥈', '🥉'];
  const RANK_COLORS = ['from-amber-400 to-amber-600', 'from-slate-300 to-slate-500', 'from-orange-400 to-orange-600'];

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Leaderboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Top performers on the platform</p>
      </div>

      <div className="flex gap-2 rounded-2xl p-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        {(['experts', 'users'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={tab === t ? {
              background: 'var(--surface)',
              color: 'var(--accent)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            } : {
              color: 'var(--text-muted)',
            }}>
            {t === 'experts' ? '🧠 Top Experts' : '👥 Top Users'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {tab === 'experts' && experts.map((e, i) => (
            <div key={e.id} className={`card flex items-center gap-4 ${i < 3 ? '' : ''}`}
              style={i < 3 ? { borderColor: 'rgba(251,191,36,0.2)', background: 'var(--surface)' } : {}}>
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${RANK_COLORS[i] ?? 'from-slate-400 to-slate-600'} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
                {i < 3 ? MEDALS[i] : `#${i + 1}`}
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {e.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{e.name}</span>
                  {e.isVerified && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                      style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {e.domain?.icon} {e.domain?.name} · {e.yearsExperience} yrs
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-black text-amber-500">⭐ {e.rating.toFixed(1)}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.totalReviews} reviews</div>
              </div>
            </div>
          ))}

          {tab === 'users' && (
            <div className="card text-center py-10" style={{ color: 'var(--text-muted)' }}>
              <div className="text-4xl mb-2">👥</div>
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>User leaderboard coming soon</p>
              <p className="text-sm mt-1">Start asking questions to earn reputation points!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
