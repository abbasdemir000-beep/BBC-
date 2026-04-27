'use client';
import { useState, useCallback } from 'react';

interface Expert {
  id: string; name: string; bio: string; rating: number;
  yearsExperience: number; isVerified: boolean;
  domain?: { name: string; icon: string; color: string };
}
interface Consultation {
  id: string; title: string; description: string; status: string;
  difficulty: string;
  domain?: { name: string; icon: string };
  _count: { submissions: number };
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  active:    { bg: 'rgba(52,211,153,0.1)',   color: '#34d399' },
  examining: { bg: 'rgba(251,191,36,0.1)',   color: '#fbbf24' },
  completed: { bg: 'rgba(148,163,184,0.1)',  color: '#94a3b8' },
  routing:   { bg: 'rgba(167,139,250,0.1)',  color: '#a78bfa' },
  pending:   { bg: 'rgba(148,163,184,0.1)',  color: '#94a3b8' },
};

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | 'experts' | 'consultations'>('all');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (query: string, t: string) => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${t}`);
    if (res.ok) {
      const data = await res.json();
      setExperts(data.experts ?? []);
      setConsultations(data.consultations ?? []);
    }
    setSearched(true);
    setLoading(false);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    search(q, type);
  }

  const typeFilters = [
    { key: 'all',           label: '🌐 All' },
    { key: 'experts',       label: '🧠 Experts' },
    { key: 'consultations', label: '❓ Questions' },
  ] as const;

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Search</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Find experts and questions across all domains
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="flex gap-3">
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search experts, questions, domains…"
            className="input flex-1"
          />
          <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 disabled:opacity-60">
            {loading ? '…' : '🔍 Search'}
          </button>
        </div>
        <div className="flex gap-2">
          {typeFilters.map(t => (
            <button key={t.key} type="button" onClick={() => { setType(t.key); if (q) search(q, t.key); }}
              className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
              style={type === t.key ? {
                background: 'rgba(99,102,241,0.12)',
                color: 'var(--accent)',
                border: '1px solid rgba(99,102,241,0.2)',
              } : {
                background: 'var(--surface-2)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </form>

      {!searched && (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-medium">Type something to search</p>
          <p className="text-sm mt-1">Search across domains, experts, and hundreds of questions</p>
        </div>
      )}

      {searched && experts.length === 0 && consultations.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-5xl mb-3">😔</div>
          <p className="font-medium">No results found for &ldquo;{q}&rdquo;</p>
          <p className="text-sm mt-1">Try different keywords or browse by domain</p>
        </div>
      )}

      {experts.length > 0 && (type === 'all' || type === 'experts') && (
        <div className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            🧠 Experts
            <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
              {experts.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {experts.map(e => (
              <div key={e.id} className="card flex items-start gap-4 transition-all">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {e.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{e.name}</span>
                    {e.isVerified && (
                      <span className="text-xs px-2 py-0.5 rounded-lg font-medium"
                        style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>
                        ✓ Verified
                      </span>
                    )}
                    {e.domain && (
                      <span className="text-xs px-2 py-0.5 rounded-lg"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        {e.domain.icon} {e.domain.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{e.bio}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>⭐ {e.rating.toFixed(1)}</span>
                    <span>🎓 {e.yearsExperience} yrs exp</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {consultations.length > 0 && (type === 'all' || type === 'consultations') && (
        <div className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            ❓ Questions
            <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
              {consultations.length}
            </span>
          </h2>
          <div className="space-y-3">
            {consultations.map(c => {
              const ss = STATUS_STYLE[c.status] ?? STATUS_STYLE.pending;
              return (
                <div key={c.id} className="card transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</h3>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                        {c.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {c.domain && (
                          <span className="text-xs px-2 py-1 rounded-lg"
                            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                            {c.domain.icon} {c.domain.name}
                          </span>
                        )}
                        <span className="text-xs px-2 py-1 rounded-lg font-medium"
                          style={{ background: ss.bg, color: ss.color }}>
                          {c.status}
                        </span>
                        <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{c.difficulty}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {c._count.submissions}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>answers</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
