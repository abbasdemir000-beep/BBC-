'use client';
import { useEffect, useState } from 'react';

interface Expert { id: string; name: string; rating: number; totalReviews: number; yearsExperience: number; isVerified: boolean; domain?: { name: string; icon: string; color: string }; }
interface TopUser { id: string; name: string; reputation: number; _count: { consultations: number }; }

export default function Leaderboard() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [users, setUsers] = useState<TopUser[]>([]);
  const [tab, setTab] = useState<'experts' | 'users'>('experts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
    ]).then(([stats]) => {
      setExperts(stats.topExperts ?? []);
      setLoading(false);
    });
  }, []);

  const MEDALS = ['🥇', '🥈', '🥉'];
  const RANK_COLORS = ['from-amber-400 to-amber-600', 'from-slate-300 to-slate-500', 'from-orange-400 to-orange-600'];

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
        <p className="text-slate-500 text-sm mt-1">Top performers on the platform</p>
      </div>

      <div className="flex gap-2 bg-slate-100 rounded-2xl p-1">
        {(['experts', 'users'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-white text-brand-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'experts' ? '🧠 Top Experts' : '👥 Top Users'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">{[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-slate-200 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {tab === 'experts' && experts.map((e, i) => (
            <div key={e.id} className={`card flex items-center gap-4 ${i < 3 ? 'border border-amber-100 bg-amber-50/30' : ''}`}>
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${RANK_COLORS[i] ?? 'from-slate-200 to-slate-400'} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
                {i < 3 ? MEDALS[i] : `#${i + 1}`}
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {e.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">{e.name}</span>
                  {e.isVerified && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-medium">✓</span>}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {e.domain?.icon} {e.domain?.name} · {e.yearsExperience} yrs
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-black text-amber-600">⭐ {e.rating.toFixed(1)}</div>
                <div className="text-xs text-slate-400">{e.totalReviews} reviews</div>
              </div>
            </div>
          ))}

          {tab === 'users' && (
            <div className="card text-center py-10 text-slate-400">
              <div className="text-4xl mb-2">👥</div>
              <p className="font-medium">User leaderboard coming soon</p>
              <p className="text-sm mt-1">Start asking questions to earn reputation points!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
