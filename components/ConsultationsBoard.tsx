'use client';
import { useEffect, useState, useCallback } from 'react';

interface Consultation {
  id: string;
  title: string;
  description: string;
  status: string;
  questionType?: string;
  difficulty?: string;
  urgency: string;
  prizePoints: number;
  createdAt: string;
  domain?: { name: string; icon: string; color: string };
  user: { name: string };
  _count: { submissions: number };
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',    cls: 'badge-gray' },
  analyzing: { label: 'Analyzing', cls: 'badge-blue' },
  routing:   { label: 'Routing',   cls: 'badge-purple' },
  active:    { label: 'Active',    cls: 'badge-green' },
  examining: { label: 'Exam',      cls: 'badge-gold' },
  judging:   { label: 'Judging',   cls: 'badge-blue' },
  completed: { label: 'Done',      cls: 'badge-green' },
  cancelled: { label: 'Cancelled', cls: 'badge-red' },
};

const URGENCY_COLORS: Record<string, string> = {
  low: 'text-slate-400', normal: 'text-blue-500', high: 'text-amber-500', critical: 'text-red-500',
};

export default function ConsultationsBoard() {
  const [items, setItems] = useState<Consultation[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Knowledge Competitions</h1>
          <p className="text-slate-500 text-sm mt-1">{total} questions competing for the best answer</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'active', 'examining', 'completed'].map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              status === s ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s === '' ? 'All' : STATUS_LABELS[s]?.label ?? s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(c => <ConsultationRow key={c.id} consultation={c} />)}
          {items.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">🔍</div>
              <p>No competitions found</p>
            </div>
          )}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-50">Prev</button>
          <span className="text-sm text-slate-600">{page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}

function ConsultationRow({ consultation: c }: { consultation: Consultation }) {
  const st = STATUS_LABELS[c.status] ?? { label: c.status, cls: 'badge-gray' };
  return (
    <div className="card hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {c.domain && <span className="text-sm">{c.domain.icon}</span>}
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{c.title}</h3>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{c.description}</p>
          <div className="flex items-center gap-3 flex-wrap">
            {c.domain && <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{c.domain.name}</span>}
            {c.difficulty && <span className="text-xs text-slate-500 capitalize">{c.difficulty}</span>}
            {c.questionType && <span className="text-xs text-slate-400 capitalize">{c.questionType.replace('_', ' ')}</span>}
            <span className={`text-xs font-medium ${URGENCY_COLORS[c.urgency]}`}>
              {c.urgency === 'critical' ? '🔴' : c.urgency === 'high' ? '🟡' : '🔵'} {c.urgency}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={st.cls}>{st.label}</span>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-500">🏆 {c.prizePoints}</div>
            <div className="text-xs text-slate-400">points</div>
          </div>
          <div className="text-xs text-slate-500">{c._count.submissions} answers</div>
        </div>
      </div>
    </div>
  );
}
