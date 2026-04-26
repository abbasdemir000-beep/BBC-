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
    <div className="p-8 space-y-8" dir={dir}>
      {selectedExpert && <ExpertProfileModal expertId={selectedExpert} onClose={() => setSelectedExpert(null)} />}

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
        <h1 className="text-4xl font-light tracking-tight serif">{t('exp_title')}</h1>
        <p className="tag-editorial mt-3">The Directory — {total} specialists</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', fontSize: 13, outline: 'none', width: 220, fontFamily: 'Inter', transition: 'border-color 0.15s' }}
          placeholder={t('exp_search')}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-primary)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <select
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'Inter' }}
          value={domain}
          onChange={e => { setDomain(e.target.value); setPage(1); }}>
          <option value="">{t('exp_all_domains')}</option>
          {domains.map(d => <option key={d.slug} value={d.slug}>{d.icon} {d.name}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: '1px solid var(--border)', padding: '10px 14px', fontFamily: 'Inter', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={verified} onChange={e => { setVerified(e.target.checked); setPage(1); }} />
          {t('exp_verified')}
        </label>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-52 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {experts.map((expert, i) => (
            <motion.div key={expert.id}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}>
              <ExpertCard expert={expert} onViewProfile={() => setSelectedExpert(expert.id)} />
            </motion.div>
          ))}
          {experts.length === 0 && (
            <p className="col-span-3 text-sm italic serif py-12 text-center" style={{ opacity: 0.4 }}>
              No architects found.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4"
          style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-editorial-outline disabled:opacity-40" style={{ padding: '8px 20px' }}>{t('prev')}</button>
          <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {t('page')} {page} {t('of')} {pages}
          </span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="btn-editorial-outline disabled:opacity-40" style={{ padding: '8px 20px' }}>{t('next')}</button>
        </div>
      )}
    </div>
  );
}

function ExpertCard({ expert, onViewProfile }: { expert: Expert; onViewProfile: () => void }) {
  const { t } = useLang();

  return (
    <div className="editorial-card p-6 cursor-pointer h-full flex flex-col" onClick={onViewProfile}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-16 flex items-center justify-center text-xl font-black flex-shrink-0 serif italic"
          style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
          {expert.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Inter' }}>
              {expert.name}
            </span>
            {expert.isVerified && (
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Inter' }}>✓</span>
            )}
          </div>
          {expert.domain && (
            <span className="tag-editorial text-[9px]">{expert.domain.icon} {expert.domain.name}</span>
          )}
        </div>
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
          style={{ background: expert.isAvailable ? '#2d7a50' : 'var(--text-muted)' }}
          title={expert.isAvailable ? t('exp_available') : t('exp_busy')} />
      </div>

      {/* Bio */}
      <p className="text-sm italic serif line-clamp-3 mb-5 leading-relaxed flex-1"
        style={{ opacity: 0.6 }}>
        {expert.bio}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center pt-4"
        style={{ borderTop: '1px solid var(--border)' }}>
        <div>
          <div className="text-base font-bold italic serif" style={{ color: 'var(--accent)' }}>
            {expert.rating.toFixed(1)}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'Inter' }}>
            {expert.totalReviews} {t('exp_reviews')}
          </div>
        </div>
        <div>
          <div className="text-base font-bold serif" style={{ color: 'var(--text-primary)' }}>
            {expert.yearsExperience}{t('years')}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'Inter' }}>
            {t('exp_experience')}
          </div>
        </div>
        <div>
          <div className="text-base font-bold serif" style={{ color: 'var(--text-primary)' }}>
            {expert.totalWins}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'Inter' }}>
            {t('exp_wins')}
          </div>
        </div>
      </div>
    </div>
  );
}
