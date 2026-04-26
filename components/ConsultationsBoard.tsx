'use client';
import { useEffect, useState, useCallback } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';
import { motion } from 'framer-motion';

interface Consultation {
  id: string; title: string; description: string; status: string;
  questionType?: string; difficulty?: string; urgency: string;
  prizePoints: number; createdAt: string;
  domain?: { name: string; icon: string; color: string };
  user: { name: string };
  _count: { submissions: number };
}

const STATUS_MAP: Record<string, string> = {
  pending: 'badge-gray', analyzing: 'badge-blue', routing: 'badge-purple',
  active: 'badge-green', examining: 'badge-gold', completed: 'badge-green', cancelled: 'badge-red',
};

const URGENCY_COLOR: Record<string, string> = {
  low: '#2d7a50', normal: '#4b8fa8', high: '#b87333', critical: '#a83230',
};

export default function ConsultationsBoard() {
  const [items, setItems] = useState<Consultation[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const { t, dir } = useLang();

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (status) params.set('status', status);
    fetch(`/api/consultations?${params}`)
      .then(r => r.json())
      .then(d => { setItems(d.consultations); setTotal(d.total); setPages(d.pages); })
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const statusFilters = [
    { key: '',          label: t('comp_all')     },
    { key: 'pending',   label: t('comp_pending') },
    { key: 'active',    label: t('comp_active')  },
    { key: 'examining', label: t('comp_exam')    },
    { key: 'completed', label: t('comp_done')    },
  ];

  return (
    <div className="space-y-12" dir={dir}>
      {/* Header */}
      <div className="flex justify-between items-baseline flex-wrap mb-10 gap-3">
        <div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight serif">
            Marketplace <span className="italic">Bounties</span>
          </h1>
          <p className="tag-editorial mt-3">Open Inquiries — {total}</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-6 flex-wrap pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        {statusFilters.map(s => (
          <button key={s.key} onClick={() => { setStatus(s.key); setPage(1); }}
            className="nav-link"
            style={{ color: 'var(--text-primary)', borderBottom: status === s.key ? '1px solid var(--text-primary)' : 'none', opacity: status === s.key ? 1 : 0.38, paddingBottom: 2 }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-0">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 skeleton mb-1" />)}
        </div>
      ) : (
        <div className="space-y-0">
          {items.map(c => (
            <motion.div key={c.id} whileHover={{ x: 5 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 group cursor-pointer transition-colors"
              style={{ borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              <div className="flex-1 space-y-2 pr-8">
                <div className="font-bold text-xl tracking-tight leading-tight transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}>
                  {c.title}
                </div>
                <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest font-sans"
                  style={{ opacity: 0.4, marginTop: 8 }}>
                  {c.domain && <span className="italic serif not-italic">{c.domain.name}</span>}
                  <span>/</span>
                  <span>{c._count.submissions} {t('comp_answers')}</span>
                  {c.difficulty && <><span>/</span><span>{c.difficulty}</span></>}
                  <span style={{ color: URGENCY_COLOR[c.urgency] ?? 'inherit', opacity: 1 }}>
                    {c.urgency}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-8 mt-5 md:mt-0 shrink-0">
                <div>
                  <div className="text-3xl font-bold italic serif tracking-tight">
                    ${c.prizePoints}
                  </div>
                  <div className="text-[9px] uppercase font-bold tracking-widest font-sans mt-1"
                    style={{ opacity: 0.4 }}>{t('comp_points')}</div>
                </div>
                <span className={STATUS_MAP[c.status] ?? 'badge-gray'}>{c.status}</span>
                <button className="btn-editorial-outline" style={{ padding: '8px 20px', whiteSpace: 'nowrap' }}>
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
          {items.length === 0 && (
            <p className="text-sm italic serif py-16 text-center" style={{ opacity: 0.4 }}>
              No bounties found.
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
            {page} {t('of')} {pages}
          </span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="btn-editorial-outline" style={{ padding: '8px 20px' }}>{t('next')}</button>
        </div>
      )}
    </div>
  );
}
