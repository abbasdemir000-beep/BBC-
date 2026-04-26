'use client';
import { useEffect, useState, useCallback } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';
import ExpertProfileModal from './ExpertProfileModal';

interface Expert {
  id: string; name: string; bio: string; yearsExperience: number;
  hourlyRate: number; rating: number; totalReviews: number; totalWins: number;
  isVerified: boolean; isAvailable: boolean;
  domain?: { name: string; icon: string; color: string; slug: string };
}

export default function ExpertsDirectory() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [domains, setDomains] = useState<Array<{ id: string; name: string; slug: string; icon: string }>>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [domain, setDomain] = useState('');
  const [search, setSearch] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const { t, dir } = useLang();

  useEffect(() => {
    fetch('/api/domain').then(r => r.json()).then(d => setDomains(d.domains));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (domain) params.set('domain', domain);
    if (search) params.set('search', search);
    if (verified) params.set('verified', 'true');
    fetch(`/api/experts?${params}`)
      .then(r => r.json())
      .then(d => { setExperts(d.experts); setTotal(d.total); setPages(d.pages); })
      .finally(() => setLoading(false));
  }, [page, domain, search, verified]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-8 space-y-6" dir={dir}>
      {selectedExpert && <ExpertProfileModal expertId={selectedExpert} onClose={() => setSelectedExpert(null)} />}

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('exp_title')}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{total} {t('exp_title').toLowerCase()}</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          className="input w-64"
          placeholder={t('exp_search')}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="input w-52"
          value={domain}
          onChange={e => { setDomain(e.target.value); setPage(1); }}
          style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}
        >
          <option value="">{t('exp_all_domains')}</option>
          {domains.map(d => <option key={d.slug} value={d.slug}>{d.icon} {d.name}</option>)}
        </select>
        <label
          className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <input type="checkbox" className="rounded accent-indigo-500" checked={verified} onChange={e => { setVerified(e.target.checked); setPage(1); }} />
          {t('exp_verified')}
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-52 skeleton rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experts.map(expert => (
            <ExpertCard key={expert.id} expert={expert} onViewProfile={() => setSelectedExpert(expert.id)} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-50">{t('prev')}</button>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('page')} {page} {t('of')} {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary disabled:opacity-50">{t('next')}</button>
        </div>
      )}
    </div>
  );
}

function ExpertCard({ expert, onViewProfile }: { expert: Expert; onViewProfile: () => void }) {
  const { t } = useLang();
  return (
    <div className="card cursor-pointer group" onClick={onViewProfile}
      style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>

      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
          {expert.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{expert.name}</span>
            {expert.isVerified && (
              <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                style={{ background: '#38bdf8' }}>✓</span>
            )}
          </div>
          {expert.domain && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {expert.domain.icon} {expert.domain.name}
            </span>
          )}
        </div>
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
          style={{ background: expert.isAvailable ? '#34d399' : 'var(--text-muted)' }}
          title={expert.isAvailable ? t('exp_available') : t('exp_busy')}
        />
      </div>

      {/* Bio */}
      <p className="text-xs line-clamp-2 mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {expert.bio}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="px-2 py-1.5 rounded-xl" style={{ background: 'var(--surface-2)' }}>
          <div className="text-sm font-bold" style={{ color: '#fbbf24' }}>⭐ {expert.rating.toFixed(1)}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{expert.totalReviews} {t('exp_reviews')}</div>
        </div>
        <div className="px-2 py-1.5 rounded-xl" style={{ background: 'var(--surface-2)' }}>
          <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{expert.yearsExperience}{t('years')}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('exp_experience')}</div>
        </div>
        <div className="px-2 py-1.5 rounded-xl" style={{ background: 'var(--surface-2)' }}>
          <div className="text-sm font-bold" style={{ color: '#34d399' }}>{expert.totalWins}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('exp_wins')}</div>
        </div>
      </div>
    </div>
  );
}
