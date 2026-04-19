'use client';
import { useEffect, useState, useCallback } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

interface Consultation {
  id: string; title: string; description: string; status: string;
  questionType?: string; difficulty?: string; urgency: string;
  prizePoints: number; createdAt: string;
  domain?: { name: string; icon: string; color: string };
  user: { name: string };
  _count: { submissions: number };
}

const STATUS_MAP: Record<string, { cls: string }> = {
  pending: { cls: 'badge-gray' }, analyzing: { cls: 'badge-blue' },
  routing: { cls: 'badge-purple' }, active: { cls: 'badge-green' },
  examining: { cls: 'badge-gold' }, completed: { cls: 'badge-green' }, cancelled: { cls: 'badge-red' },
};

const URGENCY_COLORS: Record<string, string> = {
  low: 'text-[var(--text-muted)]', normal: 'text-blue-500', high: 'text-amber-500', critical: 'text-red-500',
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
    { key: '',          label: t('comp_all') },
    { key: 'pending',   label: t('comp_pending') },
    { key: 'active',    label: t('comp_active') },
    { key: 'examining', label: t('comp_exam') },
    { key: 'completed', label: t('comp_done') },
  ];

  return (
    <div className="p-8 space-y-6" dir={dir}>
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('comp_title')}</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">{total} {t('comp_title').toLowerCase()}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusFilters.map(s => (
          <button key={s.key} onClick={() => { setStatus(s.key); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              status === s.key ? 'bg-brand-600 text-white' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
            }`}>{s.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">{[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-[var(--surface-2)] rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {items.map(c => (
            <div key={c.id} className="card hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {c.domain && <span className="text-sm">{c.domain.icon}</span>}
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm line-clamp-1">{c.title}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3 leading-relaxed">{c.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {c.domain && <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full">{c.domain.name}</span>}
                    {c.difficulty && <span className="text-xs text-[var(--text-muted)] capitalize">{c.difficulty}</span>}
                    <span className={`text-xs font-medium ${URGENCY_COLORS[c.urgency]}`}>
                      {c.urgency === 'critical' ? '🔴' : c.urgency === 'high' ? '🟡' : '🔵'} {c.urgency}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={STATUS_MAP[c.status]?.cls ?? 'badge-gray'}>{c.status}</span>
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-500">🏆 {c.prizePoints}</div>
                    <div className="text-xs text-[var(--text-muted)]">{t('comp_points')}</div>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{c._count.submissions} {t('comp_answers')}</div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <div className="text-4xl mb-3">🔍</div>
              <p>{t('no_consultations')}</p>
            </div>
          )}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-50">{t('prev')}</button>
          <span className="text-sm text-[var(--text-secondary)]">{page} {t('of')} {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary disabled:opacity-50">{t('next')}</button>
        </div>
      )}
    </div>
  );
}
