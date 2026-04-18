'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

interface Reward {
  id: string; type: string; points: number; moneyValue: number;
  status: string; description: string; createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  win_points: '🏆', ad_reward: '📺', referral_bonus: '👥', daily_bonus: '🌅', penalty: '⚠️',
};

export default function RewardPanel() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [moneyValue, setMoneyValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingClaim, setPendingClaim] = useState<string | null>(null);
  const { t, dir } = useLang();

  function load() {
    fetch('/api/rewards?userId=demo')
      .then(r => r.json())
      .then(d => { setRewards(d.rewards); setTotalPoints(d.totalPoints); setMoneyValue(d.moneyValue); })
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function claimReward(rewardId: string, adWatched = false) {
    setClaiming(rewardId);
    const res = await fetch('/api/rewards', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expertId: 'demo', rewardId, adWatched }),
    });
    const data = await res.json() as { requiresAd?: boolean };
    if (data.requiresAd) { setPendingClaim(rewardId); setShowAdModal(true); }
    else load();
    setClaiming(null);
  }

  async function watchAd() {
    setShowAdModal(false);
    if (pendingClaim) { await claimReward(pendingClaim, true); setPendingClaim(null); }
  }

  if (loading) return <div className="p-8 animate-pulse"><div className="h-48 bg-slate-200 rounded-2xl" /></div>;

  return (
    <div className="p-8 space-y-6" dir={dir}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('rew_title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('rew_subtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-amber-400 to-amber-600 text-white">
          <div className="text-4xl mb-2">🪙</div>
          <div className="text-3xl font-bold">{totalPoints.toLocaleString()}</div>
          <div className="text-amber-100 text-sm">{t('rew_total_pts')}</div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
          <div className="text-4xl mb-2">💵</div>
          <div className="text-3xl font-bold">${moneyValue.toFixed(2)}</div>
          <div className="text-green-100 text-sm">{t('rew_money')}</div>
        </div>
        <div className="card">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-3xl font-bold text-slate-900">{rewards.filter(r => r.status === 'available').length}</div>
          <div className="text-slate-500 text-sm">{t('rew_claimable')}</div>
        </div>
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="text-2xl">💱</div>
        <div>
          <div className="font-semibold text-brand-800">{t('rew_rate')}</div>
          <div className="text-sm text-brand-600">{t('rew_min')}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">{t('rew_title')}</h2>
        {rewards.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <div className="text-4xl mb-2">🏅</div>
            <p>{t('rew_no_rewards')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="text-2xl">{TYPE_ICONS[r.type] ?? '🎁'}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">{r.description}</div>
                  <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-end">
                  <div className="font-bold text-amber-600">+{r.points} {t('pts')}</div>
                  <div className="text-xs text-slate-500">${r.moneyValue.toFixed(3)}</div>
                </div>
                {r.status === 'available' && (
                  <button onClick={() => claimReward(r.id)} disabled={claiming === r.id}
                    className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50">
                    {claiming === r.id ? '...' : t('rew_claim')}
                  </button>
                )}
                {r.status === 'claimed' && <span className="badge-green">{t('rew_claimed')}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
            <div className="text-5xl">📺</div>
            <h3 className="text-xl font-bold text-slate-900">{t('rew_watch_ad')}</h3>
            <div className="bg-slate-900 rounded-xl p-4 text-slate-400 text-sm">[Ad Placeholder — 30s]</div>
            <button onClick={watchAd} className="btn-primary w-full py-3">{t('rew_watch_claim')}</button>
            <button onClick={() => setShowAdModal(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
