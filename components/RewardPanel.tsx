'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';

interface Reward {
  id: string; type: string; points: number; moneyValue: number;
  status: string; description: string; createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  win_points: '🏆', ad_reward: '📺', referral_bonus: '👥', daily_bonus: '🌅', penalty: '⚠️',
};

export default function RewardPanel() {
  const { expert } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [moneyValue, setMoneyValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingClaim, setPendingClaim] = useState<string | null>(null);
  const { t, dir } = useLang();

  function load() {
    if (!expert) return;
    fetch(`/api/rewards?expertId=${expert.id}`)
      .then(r => r.json())
      .then(d => { setRewards(d.rewards ?? []); setTotalPoints(d.totalPoints ?? 0); setMoneyValue(d.moneyValue ?? 0); })
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, [expert?.id]);

  async function claimReward(rewardId: string, adWatched = false) {
    if (!expert) return;
    setClaiming(rewardId);
    const res = await fetch('/api/rewards', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expertId: expert.id, rewardId, adWatched }),
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

  if (loading) return (
    <div className="p-8 animate-pulse">
      <div className="h-48 rounded-2xl" style={{ background: 'var(--surface-2)' }} />
    </div>
  );

  return (
    <div className="p-8 space-y-6" dir={dir}>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('rew_title')}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('rew_subtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-white" style={{ background: 'linear-gradient(135deg,#d4a853,#c2714f)' }}>
          <div className="text-4xl mb-2">🪙</div>
          <div className="text-3xl font-bold">{totalPoints.toLocaleString()}</div>
          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{t('rew_total_pts')}</div>
        </div>
        <div className="card text-white" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
          <div className="text-4xl mb-2">💵</div>
          <div className="text-3xl font-bold">${moneyValue.toFixed(2)}</div>
          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{t('rew_money')}</div>
        </div>
        <div className="card">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {rewards.filter(r => r.status === 'available').length}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('rew_claimable')}</div>
        </div>
      </div>

      <div className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.25)' }}>
        <div className="text-2xl">💱</div>
        <div>
          <div className="font-semibold" style={{ color: '#9a7a2e' }}>{t('rew_rate')}</div>
          <div className="text-sm" style={{ color: '#b89040' }}>{t('rew_min')}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('rew_title')}</h2>
        {rewards.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <div className="text-4xl mb-2">🏅</div>
            <p>{t('rew_no_rewards')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-3 rounded-xl"
                style={{ background: 'var(--surface-2)' }}>
                <div className="text-2xl">{TYPE_ICONS[r.type] ?? '🎁'}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.description}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-end">
                  <div className="font-bold text-amber-500">+{r.points} {t('pts')}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>${r.moneyValue.toFixed(3)}</div>
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
          <div className="rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4"
            style={{ background: 'var(--surface)' }}>
            <div className="text-5xl">📺</div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('rew_watch_ad')}</h3>
            <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
              [Ad Placeholder — 30s]
            </div>
            <button onClick={watchAd} className="btn-primary w-full py-3">{t('rew_watch_claim')}</button>
            <button onClick={() => setShowAdModal(false)} className="text-xs" style={{ color: 'var(--text-muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      <WithdrawalSection totalPoints={totalPoints} />
    </div>
  );
}

function WithdrawalSection({ totalPoints }: { totalPoints: number }) {
  const [method, setMethod] = useState<'paypal' | 'bank'>('paypal');
  const [amount, setAmount] = useState(1000);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(''); setSuccess('');
    const res = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, method, details }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed');
    else setSuccess(data.message || 'Withdrawal request submitted!');
    setSubmitting(false);
  }

  const usd = (amount * 0.001).toFixed(2);

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>💸 Withdraw Points</h2>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Minimum 1,000 points ($1.00). Processing takes 3-5 business days.
      </p>

      {success ? (
        <div className="rounded-2xl p-4 text-sm font-medium"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }}>
          {success}
        </div>
      ) : (
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Amount (points)
            </label>
            <div className="flex items-center gap-3">
              <input type="range" min={1000} max={Math.max(1000, totalPoints)} step={500}
                value={amount} onChange={e => setAmount(Number(e.target.value))}
                className="flex-1" style={{ accentColor: '#c2714f' }} />
              <span className="text-lg font-bold w-24 text-right" style={{ color: '#c2714f' }}>
                {amount.toLocaleString()} pts
              </span>
            </div>
            <div className="text-center text-sm font-semibold mt-1" style={{ color: '#059669' }}>= ${usd} USD</div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Payment Method
            </label>
            <div className="flex gap-3">
              {(['paypal', 'bank'] as const).map(m => (
                <label key={m}
                  className="flex-1 flex items-center justify-center gap-2 border-2 rounded-xl p-3 cursor-pointer transition-all"
                  style={method === m
                    ? { borderColor: '#c2714f', background: 'rgba(194,113,79,0.08)', color: '#c2714f' }
                    : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
                  <span>{m === 'paypal' ? '🅿️' : '🏦'}</span>
                  <span className="text-sm font-semibold capitalize">{m === 'paypal' ? 'PayPal' : 'Bank Transfer'}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              {method === 'paypal' ? 'PayPal Email' : 'IBAN / Account Number'}
            </label>
            <input value={details} onChange={e => setDetails(e.target.value)} required
              placeholder={method === 'paypal' ? 'your@paypal.com' : 'IBAN or account number'}
              className="input w-full px-3 py-2 text-sm" />
          </div>

          {error && (
            <div className="rounded-xl p-3 text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting || totalPoints < 1000}
            className="w-full py-3 text-white rounded-xl font-semibold disabled:opacity-60 transition-all"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            {submitting ? 'Submitting…' : totalPoints < 1000 ? 'Need 1,000+ points' : `Withdraw $${usd} →`}
          </button>
        </form>
      )}
    </div>
  );
}
