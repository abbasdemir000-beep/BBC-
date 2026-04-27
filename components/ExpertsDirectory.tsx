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
    if (domain)   params.set('domain', domain);
    if (search)   params.set('search', search);
    if (verified) params.set('verified', 'true');
    fetch(`/api/experts?${params}`)
      .then(r => r.json())
      .then(d => { setExperts(d.experts); setTotal(d.total); setPages(d.pages); })
      .finally(() => setLoading(false));
  }, [page, domain, search, verified]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12" dir={dir}>
      {selectedExpert && <ExpertProfileModal expertId={selectedExpert} onClose={() => setSelectedExpert(null)} />}

      {/* Header */}
      <div className="mb-10">
        <p className="tag-editorial mb-3">Directory</p>
        <h1 className="font-display text-4xl font-light italic mb-2" style={{ color: 'var(--ink)' }}>
          {t('exp_title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>{total} verified experts across {domains.length} domains</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8 pb-6 flex-wrap" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <input className="input-editorial w-60" placeholder={t('exp_search')} value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="input-editorial w-52" value={domain} onChange={e => { setDomain(e.target.value); setPage(1); }}
          style={{ cursor: 'pointer' }}>
          <option value="">{t('exp_all_domains')}</option>
          {domains.map(d => <option key={d.slug} value={d.slug}>{d.icon} {d.name}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-widest"
          style={{ color: verified ? 'var(--ink)' : 'var(--ink-muted)', letterSpacing: '0.08em' }}>
          <input type="checkbox" className="accent-ink" checked={verified}
            onChange={e => { setVerified(e.target.checked); setPage(1); }} />
          {t('exp_verified')}
        </label>
      </div>

      {/* 2-col portrait grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ border: '1px solid var(--border-subtle)' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 skeleton" />)}
        </div>
      ) : experts.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--ink-muted)' }}>
          <p className="font-display text-2xl italic mb-2">No experts found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ border: '1px solid var(--border-subtle)' }}>
          {experts.map((expert, i) => (
            <ExpertCard key={expert.id} expert={expert} index={i} totalCount={experts.length}
              onViewProfile={() => setSelectedExpert(expert.id)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-10">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-editorial-outline py-2 px-5 disabled:opacity-30">
            {t('prev')}
          </button>
          <span className="section-label">{t('page')} {page} {t('of')} {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="btn-editorial-outline py-2 px-5 disabled:opacity-30">
            {t('next')}
          </button>
        </div>
      )}
    </div>
  );
}

function ExpertCard({ expert, index, totalCount, onViewProfile }: {
  expert: Expert; index: number; totalCount: number; onViewProfile: () => void;
}) {
  const { t } = useLang();
  const col = index % 2;
  const row = Math.floor(index / 2);
  const isLastRow = index >= totalCount - (totalCount % 2 === 0 ? 2 : 1);

  return (
    <div className="flex gap-5 p-6 cursor-pointer group transition-colors"
      style={{
        borderRight:  col === 0 ? '1px solid var(--border-subtle)' : undefined,
        borderBottom: !isLastRow ? '1px solid var(--border-subtle)' : undefined,
      }}
      onClick={onViewProfile}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-warm)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = ''; }}>

      {/* Ink initials block */}
      <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center text-lg font-semibold"
        style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
        {expert.name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{expert.name}</span>
            {expert.isVerified && (
              <span className="ms-2 badge-editorial" style={{ color: 'var(--accent)', fontSize: '8px' }}>Verified</span>
            )}
          </div>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${expert.isAvailable ? 'bg-green-500' : 'bg-neutral-300'}`}
            title={expert.isAvailable ? t('exp_available') : t('exp_busy')} />
        </div>

        {expert.domain && (
          <div className="tag-editorial mb-2">{expert.domain.icon} {expert.domain.name}</div>
        )}

        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--ink-muted)' }}>{expert.bio}</p>

        {/* Stats row */}
        <div className="flex items-center gap-5">
          <div>
            <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{expert.rating.toFixed(1)}</span>
            <span className="ms-1 section-label" style={{ fontSize: '9px' }}>/{expert.totalReviews} reviews</span>
          </div>
          <div>
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{expert.yearsExperience}</span>
            <span className="ms-1 section-label" style={{ fontSize: '9px' }}>{t('years')} exp</span>
          </div>
          <div>
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{expert.totalWins}</span>
            <span className="ms-1 section-label" style={{ fontSize: '9px' }}>{t('exp_wins')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
