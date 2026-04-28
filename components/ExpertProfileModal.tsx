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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ background: 'var(--surface)' }}
        onClick={e => e.stopPropagation()}>
        <div className="modal-header px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              {!loading && expert ? expert.name.charAt(0) : '?'}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{expert?.name ?? '...'}</h2>
              {expert?.isVerified && (
                <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  ✓ Verified Expert
                </span>
              )}
              {expert?.domain && (
                <div className="text-white/70 text-xs mt-1">{expert.domain.icon} {expert.domain.name}</div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 rounded-xl" style={{ background: 'var(--surface-2)' }} />
            ))}
          </div>
        ) : !expert ? (
          <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>Expert not found</div>
        ) : (
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                About
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{expert.bio}</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Rating', value: `⭐ ${expert.rating.toFixed(1)}`, sub: `${expert.totalReviews} reviews` },
                { label: 'Experience', value: `${expert.yearsExperience} yrs`, sub: 'expertise' },
                { label: 'Answers', value: String(expert.totalAnswers ?? expert.totalWins), sub: 'submitted' },
                { label: 'Pass Rate', value: expert.passRate != null ? `${expert.passRate.toFixed(0)}%` : `${expert.totalWins} wins`, sub: 'exam pass' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)' }}>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2"
              style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full"
                  style={{ background: expert.isAvailable ? '#10b981' : 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {expert.isAvailable ? 'Available for questions' : 'Currently busy'}
                </span>
              </div>
              <div className="text-sm font-semibold" style={{ color: '#c2714f' }}>${expert.hourlyRate}/hr</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
