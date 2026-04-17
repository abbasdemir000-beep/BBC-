'use client';
import { useEffect, useState } from 'react';

interface Reward {
  id: string;
  type: string;
  points: number;
  moneyValue: number;
  status: string;
  description: string;
  createdAt: string;
}

export default function RewardPanel() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [moneyValue, setMoneyValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingClaim, setPendingClaim] = useState<string | null>(null);

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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expertId: 'demo', rewardId, adWatched }),
    });
    const data = await res.json() as { requiresAd?: boolean };
    if (data.requiresAd) {
      setPendingClaim(rewardId);
      setShowAdModal(true);
    } else {
      load();
    }
    setClaiming(null);
  }

  async function watchAd() {
    setShowAdModal(false);
    if (pendingClaim) {
      await claimReward(pendingClaim, true);
      setPendingClaim(null);
    }
  }

  const TYPE_ICONS: Record<string, string> = {
    win_points: '🏆', ad_reward: '📺', referral_bonus: '👥', daily_bonus: '🌅', penalty: '⚠️',
  };

  if (loading) return <div className="p-8 animate-pulse"><div className="h-48 bg-slate-200 rounded-2xl" /></div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rewards & Points</h1>
        <p className="text-slate-500 text-sm mt-1">Win competitions to earn points, watch ads to claim, convert to real money</p>
      </div>

      {/* Balance */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-amber-400 to-amber-600 text-white">
          <div className="text-4xl mb-2">🪙</div>
          <div className="text-3xl font-bold">{totalPoints.toLocaleString()}</div>
          <div className="text-amber-100 text-sm">Total Points</div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
          <div className="text-4xl mb-2">💵</div>
          <div className="text-3xl font-bold">${moneyValue.toFixed(2)}</div>
          <div className="text-green-100 text-sm">Money Value</div>
        </div>
        <div className="card">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-3xl font-bold text-slate-900">{rewards.filter(r => r.status === 'available').length}</div>
          <div className="text-slate-500 text-sm">Claimable Rewards</div>
        </div>
      </div>

      {/* How to earn */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">How to Earn Points</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: '🏆', title: 'Win Competition', points: '+500–2000', desc: 'Score highest in knowledge competition' },
            { icon: '📺', title: 'Watch Ad', points: '+50–200', desc: 'Watch rewarded ads after winning' },
            { icon: '👥', title: 'Refer Expert', points: '+100', desc: 'Invite qualified experts to join' },
            { icon: '🌅', title: 'Daily Bonus', points: '+50', desc: 'Log in every day for bonus points' },
          ].map(e => (
            <div key={e.title} className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{e.icon}</div>
              <div className="text-sm font-semibold text-slate-800">{e.title}</div>
              <div className="text-base font-bold text-green-600 my-1">{e.points}</div>
              <div className="text-xs text-slate-500">{e.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion rate */}
      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="text-2xl">💱</div>
        <div>
          <div className="font-semibold text-brand-800">Conversion Rate: 1000 points = $1.00</div>
          <div className="text-sm text-brand-600">Minimum withdrawal: 10,000 points ($10). Daily limit: 50,000 points ($50).</div>
        </div>
      </div>

      {/* Rewards list */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Your Rewards</h2>
        {rewards.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <div className="text-4xl mb-2">🏅</div>
            <p>No rewards yet. Win competitions to earn points!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="text-2xl">{TYPE_ICONS[r.type] ?? '🎁'}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">{r.description}</div>
                  <div className="text-xs text-slate-500 capitalize">{r.type.replace('_', ' ')} · {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-600">+{r.points} pts</div>
                  <div className="text-xs text-slate-500">${r.moneyValue.toFixed(3)}</div>
                </div>
                {r.status === 'available' && (
                  <button
                    onClick={() => claimReward(r.id)}
                    disabled={claiming === r.id}
                    className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                  >
                    {claiming === r.id ? '...' : 'Claim'}
                  </button>
                )}
                {r.status === 'claimed' && <span className="badge-green">Claimed</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
            <div className="text-5xl">📺</div>
            <h3 className="text-xl font-bold text-slate-900">Watch a Short Ad</h3>
            <p className="text-slate-600 text-sm">Watch a 30-second rewarded ad to claim your points. This keeps the platform free for everyone!</p>
            <div className="bg-slate-900 rounded-xl p-4 text-slate-400 text-sm">
              [Ad Placeholder — 30 seconds]
            </div>
            <button onClick={watchAd} className="btn-primary w-full py-3">Watch & Claim Points</button>
            <button onClick={() => setShowAdModal(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
