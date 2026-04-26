'use client';
import { useEffect, useState, useCallback } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';
import ExpertProfileModal from './ExpertProfileModal';
import { motion } from 'framer-motion';

interface Expert {
  id: string; name: string; bio: string; yearsExperience: number;
  hourlyRate: number; rating: number; totalReviews: number; totalWins: number;
  isVerified: boolean; isAvailable: boolean;
  domain?: { name: string; icon: string; color: string; slug: string };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24"
          fill={i <= Math.floor(rating) ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="2"
          style={{ color: i <= Math.floor(rating) ? 'var(--text-primary)' : 'var(--border)' }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span className="ml-2 text-[11px] font-bold font-sans">{rating.toFixed(1)}</span>
    </div>
  );
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
    <div className="space-y-12" dir={dir}>
      {selectedExpert && <ExpertProfileModal expertId={selectedExpert} onClose={() => setSelectedExpert(null)} />}

      {/* Header */}
      <div className="flex justify-between items-baseline flex-wrap mb-10 gap-3">
        <div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight serif">{t('exp_title')}</h1>
          <p className="tag-editorial mt-3">The Directory — {total} specialists</p>
        </div>
        <div className="flex gap-3 flex-wrap mt-4">
          <input
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 16px', fontSize: 13, outline: 'none', width: 220, fontFamily: 'Inter' }}
            placeholder={t('exp_search')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <select
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 16px', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'Inter' }}
            value={domain}
            onChange={e => { setDomain(e.target.value); setPage(1); }}>
            <option value="">{t('exp_all_domains')}</option>
            {domains.map(d => <option key={d.slug} value={d.slug}>{d.icon} {d.name}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontFamily: 'Inter' }}>
            <input type="checkbox" checked={verified} onChange={e => { setVerified(e.target.checked); setPage(1); }} />
            {t('exp_verified')}
          </label>
          <button className="btn-editorial-outline">Filter Results</button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {experts.map(expert => (
            <motion.div key={expert.id}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => setSelectedExpert(expert.id)}>
              <div className="flex gap-6 items-start">
                {/* Portrait */}
                <div className="w-20 h-24 shrink-0 overflow-hidden relative"
                  style={{ background: 'var(--text-primary)' }}>
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold italic serif uppercase"
                    style={{ background: 'rgba(168,141,94,0.2)', color: 'var(--bg)', opacity: 0.9 }}>
                    {expert.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute inset-0 transition-colors group-hover:opacity-0"
                    style={{ background: 'rgba(26,26,26,0.08)' }} />
                  {expert.isAvailable && (
                    <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full"
                      style={{ background: '#2d7a50' }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col pb-6 w-full"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-xl leading-none transition-colors group-hover:text-accent"
                      style={{ color: 'var(--text-primary)' }}>
                      {expert.name}
                      {expert.isVerified && (
                        <span className="ml-2 text-[10px] font-sans" style={{ color: '#4b8fa8' }}>✓ Verified</span>
                      )}
                    </span>
                    <span className="text-[11px] font-extrabold tracking-widest font-sans">
                      ${expert.hourlyRate}/H
                    </span>
                  </div>
                  {expert.domain && (
                    <span className="tag-editorial text-[10px] tracking-widest mt-1">
                      {expert.domain.icon} {expert.domain.name} · {expert.yearsExperience}{t('years')} exp
                    </span>
                  )}
                  <p className="text-sm mt-3 leading-relaxed italic serif"
                    style={{ opacity: 0.6 }}>{expert.bio}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <StarRating rating={expert.rating} />
                    <span className="text-[9px] uppercase font-bold tracking-[0.2em] underline transition-opacity"
                      style={{ opacity: 0.35, fontFamily: 'Inter' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.35')}>
                      {expert.totalWins} {t('exp_wins')} · Request Session
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {experts.length === 0 && (
            <p className="col-span-2 text-sm italic serif py-16 text-center" style={{ opacity: 0.4 }}>
              No architects found matching your criteria.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-8"
          style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-editorial-outline" style={{ padding: '8px 20px' }}>{t('prev')}</button>
          <span className="text-[10px] font-bold uppercase tracking-widest font-sans" style={{ opacity: 0.5 }}>
            {t('page')} {page} {t('of')} {pages}
          </span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="btn-editorial-outline" style={{ padding: '8px 20px' }}>{t('next')}</button>
        </div>
      )}
    </div>
  );
}
