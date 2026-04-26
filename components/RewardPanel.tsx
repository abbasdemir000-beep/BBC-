'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';
import { motion } from 'framer-motion';

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

  if (loading) return (
    <div className="space-y-4">
      <div className="h-48 skeleton" />
      <div className="h-64 skeleton" />
    </div>
  );

  return (
    <div className="space-y-16" dir={dir}>
      {/* Header */}
      <div className="flex justify-between items-baseline flex-wrap mb-10 gap-3">
        <div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight serif">
            Rewards <span className="italic">Hub</span>
          </h1>
          <p className="tag-editorial mt-3">{t('rew_subtitle')}</p>
        </div>
      </div>

      {/* Balance Card — full-bleed ink */}
      <div className="editorial-card p-14 md:p-16 text-center relative overflow-hidden"
        style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-[10px] uppercase font-bold tracking-[0.4em] mb-6 font-sans" style={{ opacity: 0.55 }}>
            {t('rew_total_pts')}
          </div>
          <div className="font-light italic serif tracking-tighter mb-2"
            style={{ fontSize: 'clamp(64px, 12vw, 112px)', lineHeight: 1.1 }}>
            {totalPoints.toLocaleString()}
            <small className="text-base font-sans not-italic font-bold uppercase tracking-widest ml-3" style={{ opacity: 0.5 }}>pts</small>
          </div>
          <div className="text-2xl font-light serif italic mb-10" style={{ opacity: 0.6 }}>
            ≈ ${moneyValue.toFixed(2)} USD
          </div>
          <div className="flex gap-6">
            <button className="btn-editorial-outline"
              style={{ borderColor: 'rgba(249,247,242,0.35)', color: 'var(--bg)', padding: '10px 36px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--bg)'; }}>
              Withdraw
            </button>
            <button
              style={{ background: 'var(--bg)', color: 'var(--text-primary)', padding: '10px 36px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter', cursor: 'pointer', transition: 'all 0.15s', border: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}>
              Stake Assets
            </button>
          </div>
        </div>
      </div>

      {/* Claimable badge */}
      {rewards.filter(r => r.status === 'available').length > 0 && (
        <div style={{ border: '1px solid rgba(168,141,94,0.3)', background: 'rgba(168,141,94,0.06)', padding: '16px 24px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--accent)', fontSize: 20 }}>💱</span>
          <div>
            <div className="font-bold text-sm font-sans" style={{ color: 'var(--accent)' }}>
              {rewards.filter(r => r.status === 'available').length} {t('rew_claimable')} — {t('rew_rate')}
            </div>
            <div className="text-[10px] uppercase tracking-widest font-sans mt-0.5" style={{ opacity: 0.5 }}>{t('rew_min')}</div>
          </div>
        </div>
      )}

      {/* Intelligence Ledger */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 48 }}>
        <h3 className="text-2xl font-light italic serif mb-8">{t('rew_title')}</h3>
        {rewards.length === 0 ? (
          <p className="text-sm italic serif py-12 text-center" style={{ opacity: 0.4 }}>
            {t('rew_no_rewards')}
          </p>
        ) : (
          <div className="space-y-0">
            {rewards.map(r => (
              <motion.div key={r.id} whileHover={{ x: 4 }}
                className="flex justify-between items-center py-6 transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div className="flex items-center gap-6">
                  <div className={`w-2 h-2 rounded-full`}
                    style={{ background: r.points > 0 ? '#2d7a50' : '#a83230' }} />
                  <div>
                    <div className="font-bold text-base tracking-tight">{r.description}</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest font-sans mt-1" style={{ opacity: 0.38 }}>
                      {new Date(r.createdAt).toLocaleDateString()} · {TYPE_ICONS[r.type] ?? '🎁'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className={`text-xl font-bold italic serif`}
                      style={{ color: r.points > 0 ? 'var(--text-primary)' : '#a83230' }}>
                      {r.points > 0 ? `+${r.points}` : r.points} {t('pts')}
                    </div>
                    <div className="text-[10px] uppercase font-sans" style={{ opacity: 0.4 }}>
                      ${r.moneyValue.toFixed(3)}
                    </div>
                  </div>
                  {r.status === 'available' && (
                    <button onClick={() => claimReward(r.id)} disabled={claiming === r.id}
                      className="btn-editorial" style={{ padding: '8px 16px', fontSize: 9 }}>
                      {claiming === r.id ? '…' : t('rew_claim')}
                    </button>
                  )}
                  {r.status === 'claimed' && (
                    <span className="badge-green">{t('rew_claimed')}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(26,26,26,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="p-10 max-w-sm w-full mx-4 text-center space-y-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-5xl">📺</div>
            <h3 className="text-xl font-bold italic serif">{t('rew_watch_ad')}</h3>
            <div className="p-6 text-sm font-sans" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
              [Ad Placeholder — 30s]
            </div>
            <button onClick={watchAd} className="btn-editorial w-full">{t('rew_watch_claim')}</button>
            <button onClick={() => setShowAdModal(false)}
              className="text-[10px] uppercase tracking-widest font-bold font-sans block w-full"
              style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
              Cancel
            </button>
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, method, details }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed');
    else setSuccess(data.message || 'Withdrawal request submitted!');
    setSubmitting(false);
  }

  const usd = (amount * 0.001).toFixed(2);

  return (
    <div className="editorial-card p-10 space-y-8">
      <h2 className="text-xl font-bold italic serif flex items-center gap-2">💸 Withdraw Points</h2>
      <p className="text-sm font-sans" style={{ opacity: 0.5 }}>
        Minimum 1,000 points ($1.00). Processing takes 3–5 business days.
      </p>

      {success ? (
        <div style={{ border: '1px solid rgba(45,122,80,0.3)', background: 'rgba(45,122,80,0.06)', padding: '16px 20px', fontSize: 13, color: '#2d7a50', fontFamily: 'Inter' }}>
          {success}
        </div>
      ) : (
        <form onSubmit={handleWithdraw} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block font-sans" style={{ opacity: 0.4 }}>
              Amount (points)
            </label>
            <div className="flex items-center gap-4">
              <input type="range" min={1000} max={Math.max(1000, totalPoints)} step={500}
                value={amount} onChange={e => setAmount(Number(e.target.value))}
                className="flex-1 accent-ink" />
              <span className="text-xl font-bold italic serif w-32 text-right">
                {amount.toLocaleString()} <small className="text-xs font-sans not-italic font-bold uppercase tracking-widest" style={{ opacity: 0.5 }}>pts</small>
              </span>
            </div>
            <div className="text-center text-sm font-bold serif italic mt-1" style={{ color: 'var(--accent)' }}>= ${usd} USD</div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block font-sans" style={{ opacity: 0.4 }}>
              Payment Method
            </label>
            <div className="flex gap-4">
              {(['paypal', 'bank'] as const).map(m => (
                <label key={m} className="flex-1 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  style={{
                    border: `1px solid ${method === m ? 'var(--text-primary)' : 'var(--border)'}`,
                    padding: '12px 16px',
                    background: method === m ? 'var(--text-primary)' : 'transparent',
                    color: method === m ? 'var(--bg)' : 'var(--text-secondary)',
                  }}>
                  <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
                  <span>{m === 'paypal' ? '🅿️' : '🏦'}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest font-sans capitalize">
                    {m === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block font-sans" style={{ opacity: 0.4 }}>
              {method === 'paypal' ? 'PayPal Email' : 'IBAN / Account Number'}
            </label>
            <input value={details} onChange={e => setDetails(e.target.value)} required
              placeholder={method === 'paypal' ? 'your@paypal.com' : 'IBAN or account number'}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '12px 16px', fontSize: 13, outline: 'none', width: '100%', fontFamily: 'Inter' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')} />
          </div>

          {error && (
            <div style={{ border: '1px solid rgba(168,50,48,0.3)', background: 'rgba(168,50,48,0.06)', padding: '12px 16px', fontSize: 13, color: '#a83230', fontFamily: 'Inter' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting || totalPoints < 1000}
            className="btn-editorial w-full" style={{ padding: '14px 32px', fontSize: 11 }}>
            {submitting ? 'Submitting…' : totalPoints < 1000 ? 'Need 1,000+ points' : `Withdraw $${usd} →`}
          </button>
        </form>
      )}
    </div>
  );
}
