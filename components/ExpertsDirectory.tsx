'use client';
import { useEffect, useState, useCallback } from 'react';

interface Expert {
  id: string;
  name: string;
  bio: string;
  yearsExperience: number;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalWins: number;
  isVerified: boolean;
  isAvailable: boolean;
  domain?: { name: string; icon: string; color: string; slug: string };
}

interface DomainsRes { domains: Array<{ id: string; name: string; slug: string; icon: string }> }
interface ExpertsRes { experts: Expert[]; total: number; pages: number }

export default function ExpertsDirectory() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [domains, setDomains] = useState<DomainsRes['domains']>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [domain, setDomain] = useState('');
  const [search, setSearch] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/domain').then(r => r.json()).then((d: DomainsRes) => setDomains(d.domains));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (domain) params.set('domain', domain);
    if (search) params.set('search', search);
    if (verified) params.set('verified', 'true');
    fetch(`/api/experts?${params}`)
      .then(r => r.json())
      .then((d: ExpertsRes) => { setExperts(d.experts); setTotal(d.total); setPages(d.pages); })
      .finally(() => setLoading(false));
  }, [page, domain, search, verified]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expert Directory</h1>
          <p className="text-slate-500 text-sm mt-1">{total} verified experts across all domains</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          className="input w-64"
          placeholder="Search experts..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="input w-52" value={domain} onChange={e => { setDomain(e.target.value); setPage(1); }}>
          <option value="">All Domains</option>
          {domains.map(d => <option key={d.slug} value={d.slug}>{d.icon} {d.name}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
          <input type="checkbox" className="rounded" checked={verified} onChange={e => { setVerified(e.target.checked); setPage(1); }} />
          Verified only
        </label>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-slate-200 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {experts.map(expert => <ExpertCard key={expert.id} expert={expert} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-50">Prev</button>
          <span className="text-sm text-slate-600">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}

function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {expert.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm">{expert.name}</span>
            {expert.isVerified && <span className="text-blue-500 text-xs">✓</span>}
          </div>
          {expert.domain && (
            <span className="text-xs text-slate-500">{expert.domain.icon} {expert.domain.name}</span>
          )}
        </div>
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${expert.isAvailable ? 'bg-green-400' : 'bg-slate-300'}`} />
      </div>

      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">{expert.bio}</p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-sm font-bold text-amber-500 flex items-center justify-center gap-0.5">⭐{expert.rating.toFixed(1)}</div>
          <div className="text-xs text-slate-400">{expert.totalReviews} reviews</div>
        </div>
        <div>
          <div className="text-sm font-bold text-slate-700">{expert.yearsExperience}y</div>
          <div className="text-xs text-slate-400">experience</div>
        </div>
        <div>
          <div className="text-sm font-bold text-green-600">{expert.totalWins}</div>
          <div className="text-xs text-slate-400">wins</div>
        </div>
      </div>
    </div>
  );
}
