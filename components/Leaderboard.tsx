'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

interface Expert { id: string; name: string; rating: number; totalReviews: number; yearsExperience: number; isVerified: boolean; domain?: { name: string; icon: string; color: string }; }

export default function Leaderboard() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [tab, setTab] = useState<'experts' | 'users'>('experts');
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(stats => {
      setExperts(stats.topExperts ?? []);
      setLoading(false);
    });
  }, []);

  const MEDALS = ['🥇', '🥈', '🥉'];
  const RANK_GRADS = [
    'linear-gradient(135deg,#d4a853,#f0c97a)',
    'linear-gradient(135deg,#94a3b8,#64748b)',
    'linear-gradient(135deg,#f97316,#fb923c)',
  ];

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('nav_leaderboard')}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Top performers on the platform</p>
      </div>

      <div className="flex gap-2 rounded-2xl p-1" style={{ background: 'var(--surface-2)' }}>
        {(['experts', 'users'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={tab === t
              ? { background: 'var(--surface)', color: 'var(--accent)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-muted)' }}>
            {t === 'experts' ? '🧠 Top Experts' : '👥 Top Users'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-2xl" style={{ background: 'var(--surface-2)' }} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {tab === 'experts' && experts.map((e, i) => (
            <div key={e.id} className="card flex items-center gap-4"
              style={i < 3 ? { background: 'rgba(194,113,79,0.06)', border: '1px solid rgba(194,113,79,0.2)' } : {}}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                style={{ background: RANK_GRADS[i] ?? 'var(--surface-2)', color: i >= 3 ? 'var(--text-secondary)' : 'white' }}>
                {i < 3 ? MEDALS[i] : `#${i + 1}`}
              </div>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#c2714f,#d4a853)' }}>
                {e.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{e.name}</span>
                  {e.isVerified && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                      style={{ background: 'rgba(194,113,79,0.12)', color: 'var(--accent)' }}>✓</span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {e.domain?.icon} {e.domain?.name} · {e.yearsExperience} {t('years')}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-black" style={{ color: '#d4a853' }}>⭐ {e.rating.toFixed(1)}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.totalReviews} {t('exp_reviews')}</div>
              </div>
            </div>
          ))}

          {tab === 'users' && (
            <div className="card text-center py-10" style={{ color: 'var(--text-muted)' }}>
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
