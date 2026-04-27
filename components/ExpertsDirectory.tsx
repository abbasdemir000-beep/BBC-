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
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{total} {t('exp_count')}</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input className="input w-64" placeholder={t('exp_search')} value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="input w-52" value={domain} onChange={e => { setDomain(e.target.value); setPage(1); }}>
          <option value="">{t('exp_all_domains')}</option>
          {domains.map(d => <option key={d.slug} value={d.slug}>{d.icon} {d.name}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          <input type="checkbox" className="rounded" checked={verified} onChange={e => { setVerified(e.target.checked); setPage(1); }} />
          {t('exp_verified')}
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl" style={{ background: 'var(--surface-2)' }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {experts.map(expert => <ExpertCard key={expert.id} expert={expert} onViewProfile={() => setSelectedExpert(expert.id)} />)}
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
    <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={onViewProfile}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {expert.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{expert.name}</span>
            {expert.isVerified && <span className="text-blue-500 text-xs">✓</span>}
          </div>
          {expert.domain && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{expert.domain.icon} {expert.domain.name}</span>}
        </div>
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${expert.isAvailable ? 'bg-green-400' : 'bg-slate-300'}`}
          title={expert.isAvailable ? t('exp_available') : t('exp_busy')} />
      </div>

      <p className="text-xs line-clamp-2 mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{expert.bio}</p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-sm font-bold text-amber-500">⭐{expert.rating.toFixed(1)}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{expert.totalReviews} {t('exp_reviews')}</div>
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{expert.yearsExperience}{t('years')}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('exp_experience')}</div>
        </div>
        <div>
          <div className="text-sm font-bold text-green-500">{expert.totalWins}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('exp_wins')}</div>
        </div>
      </div>
    </div>
  );
}
