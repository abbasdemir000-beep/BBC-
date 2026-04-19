'use client';
import { useState, useCallback } from 'react';

interface Expert { id: string; name: string; bio: string; rating: number; yearsExperience: number; domain?: { name: string; icon: string; color: string }; isVerified: boolean; }
interface Consultation { id: string; title: string; description: string; status: string; difficulty: string; domain?: { name: string; icon: string }; _count: { submissions: number }; }

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

  const STATUS_COLOR: Record<string, string> = {
    active: 'bg-green-100 text-green-700', examining: 'bg-amber-100 text-amber-700',
    completed: 'bg-[var(--surface-2)] text-[var(--text-secondary)]', routing: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Search</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Find experts and questions across all domains</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="flex gap-3">
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search experts, questions, domains…"
            className="flex-1 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-brand-600 hover:to-purple-700 disabled:opacity-60 transition-all">
            {loading ? '…' : '🔍 Search'}
          </button>
        </div>
        <div className="flex gap-2">
          {(['all', 'experts', 'consultations'] as const).map(t => (
            <button key={t} type="button" onClick={() => { setType(t); if (q) search(q, t); }}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${type === t ? 'bg-brand-100 text-brand-700' : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'}`}>
              {t === 'all' ? '🌐 All' : t === 'experts' ? '🧠 Experts' : '❓ Questions'}
            </button>
          ))}
        </div>
      </form>

      {!searched && (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-medium">Type something to search</p>
          <p className="text-sm mt-1">Search across 20+ domains, 20 verified experts, and hundreds of questions</p>
        </div>
      )}

      {searched && experts.length === 0 && consultations.length === 0 && (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <div className="text-5xl mb-3">😔</div>
          <p className="font-medium">No results found for "{q}"</p>
          <p className="text-sm mt-1">Try different keywords or browse by domain</p>
        </div>
      )}

      {experts.length > 0 && (type === 'all' || type === 'experts') && (
        <div className="space-y-3">
          <h2 className="font-semibold text-[var(--text-secondary)] flex items-center gap-2">🧠 Experts <span className="text-xs bg-[var(--surface-2)] text-[var(--text-muted)] px-2 py-0.5 rounded-lg">{experts.length}</span></h2>
          <div className="grid grid-cols-1 gap-3">
            {experts.map(e => (
              <div key={e.id} className="card flex items-start gap-4 hover:border-brand-200 border border-transparent transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {e.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[var(--text-primary)]">{e.name}</span>
                    {e.isVerified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg font-medium">✓ Verified</span>}
                    {e.domain && <span className="text-xs bg-[var(--surface-2)] text-[var(--text-secondary)] px-2 py-0.5 rounded-lg">{e.domain.icon} {e.domain.name}</span>}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">{e.bio}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
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
          <h2 className="font-semibold text-[var(--text-secondary)] flex items-center gap-2">❓ Questions <span className="text-xs bg-[var(--surface-2)] text-[var(--text-muted)] px-2 py-0.5 rounded-lg">{consultations.length}</span></h2>
          <div className="space-y-3">
            {consultations.map(c => (
              <div key={c.id} className="card hover:border-brand-200 border border-transparent transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)]">{c.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {c.domain && <span className="text-xs bg-[var(--surface-2)] text-[var(--text-secondary)] px-2 py-1 rounded-lg">{c.domain.icon} {c.domain.name}</span>}
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${STATUS_COLOR[c.status] ?? 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}>{c.status}</span>
                      <span className="text-xs text-[var(--text-muted)]">{c.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xl font-bold text-[var(--text-secondary)]">{c._count.submissions}</div>
                    <div className="text-xs text-[var(--text-muted)]">answers</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
