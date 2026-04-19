'use client';
import { useEffect, useState } from 'react';

interface ExpertProfile {
  id: string;
  name: string;
  bio: string;
  yearsExperience: number;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalWins: number;
  isVerified: boolean;
  isAvailable: boolean;
  domain?: { name: string; icon: string; color: string };
  totalAnswers?: number;
  avgScore?: number;
  passRate?: number;
}

export default function ExpertProfileModal({ expertId, onClose }: { expertId: string; onClose: () => void }) {
  const [expert, setExpert] = useState<ExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/experts/${expertId}`)
      .then(r => r.json())
      .then(d => setExpert(d.expert))
      .finally(() => setLoading(false));
  }, [expertId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="auto" onClick={onClose}>
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-brand-500 to-purple-600 px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-black">
              {!loading && expert ? expert.name.charAt(0) : '?'}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{expert?.name ?? '...'}</h2>
              {expert?.isVerified && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-lg">✓ Verified Expert</span>}
              {expert?.domain && <div className="text-white/70 text-xs mt-1">{expert.domain.icon} {expert.domain.name}</div>}
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-8 bg-[var(--surface-2)] rounded-xl" />)}
          </div>
        ) : !expert ? (
          <div className="p-6 text-center text-[var(--text-muted)]">Expert not found</div>
        ) : (
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">About</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{expert.bio}</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Rating', value: `⭐ ${expert.rating.toFixed(1)}`, sub: `${expert.totalReviews} reviews` },
                { label: 'Experience', value: `${expert.yearsExperience} yrs`, sub: 'expertise' },
                { label: 'Answers', value: String(expert.totalAnswers ?? expert.totalWins), sub: 'submitted' },
                { label: 'Pass Rate', value: expert.passRate != null ? `${expert.passRate.toFixed(0)}%` : `${expert.totalWins} wins`, sub: 'exam pass' },
              ].map(s => (
                <div key={s.label} className="bg-[var(--bg)] rounded-xl p-3 text-center">
                  <div className="text-sm font-bold text-[var(--text-primary)]">{s.value}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${expert.isAvailable ? 'bg-green-400' : 'bg-[var(--border)]'}`} />
                <span className="text-sm text-[var(--text-secondary)]">{expert.isAvailable ? 'Available for questions' : 'Currently busy'}</span>
              </div>
              <div className="text-sm font-semibold text-brand-600">${expert.hourlyRate}/hr</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
