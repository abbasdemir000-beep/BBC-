'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverviewData {
  totalUsers: number;
  totalExperts: number;
  totalConsultations: number;
  totalSubmissions: number;
  pendingVerifications: Array<{ id: string; name: string; email: string; domain?: { name: string }; createdAt: string }>;
  recentFlags: Array<{ id: string; eventType: string; severity: string; score: number; expertId: string; createdAt: string }>;
  domainStats: Array<{ id: string; name: string; icon: string; expertCount: number; consultationCount: number }>;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { consultations: number };
}

interface ExpertRow {
  id: string;
  name: string;
  email: string;
  rating: number;
  totalWins: number;
  isVerified: boolean;
  isAvailable: boolean;
  createdAt: string;
  domain: { name: string } | null;
  _count: { submissions: number };
}

interface ConsultationRow {
  id: string;
  title: string;
  status: string;
  isPublic: boolean;
  prizePoints: number;
  createdAt: string;
  user: { name: string; email: string };
  domain: { name: string } | null;
  _count: { submissions: number };
}

interface FraudRow {
  id: string;
  eventType: string;
  severity: string;
  score: number;
  action: string;
  resolved: boolean;
  expertId: string | null;
  userId: string | null;
  createdAt: string;
}

interface PagedResponse<T> {
  page: number;
  pages: number;
  total: number;
  data: T[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
  critical: 'bg-red-200 text-red-900 font-bold',
};

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  analyzing: 'bg-blue-100 text-blue-700',
  routing: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  examining: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-blue-200 text-blue-800',
  cancelled: 'bg-slate-100 text-slate-600',
};

const ROLE_STYLE: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  expert: 'bg-indigo-100 text-indigo-700',
  user: 'bg-slate-100 text-slate-600',
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}

function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-2 mt-4 justify-end">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 rounded-lg text-sm disabled:opacity-40"
        style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
      >
        Prev
      </button>
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {page} / {pages}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= pages}
        className="px-3 py-1 rounded-lg text-sm disabled:opacity-40"
        style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
      >
        Next
      </button>
    </div>
  );
}

// ─── Section: Overview ────────────────────────────────────────────────────────

function OverviewSection() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin');
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function verify(expertId: string, verified: boolean) {
    setBusy(expertId);
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expertId, verified }),
    });
    setBusy(null);
    load();
  }

  if (!data) return <div className="p-8 animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl" style={{ background: 'var(--surface-2)' }} />)}</div>;

  const statCards = [
    { label: 'Total Users', value: data.totalUsers, icon: '👥' },
    { label: 'Total Experts', value: data.totalExperts, icon: '🧠' },
    { label: 'Consultations', value: data.totalConsultations, icon: '❓' },
    { label: 'Submissions', value: data.totalSubmissions, icon: '📝' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            🔍 Pending Verifications
            {data.pendingVerifications.length > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{data.pendingVerifications.length}</span>
            )}
          </h3>
          {data.pendingVerifications.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>All experts verified ✓</p>
          ) : (
            <div className="space-y-2">
              {data.pendingVerifications.map(e => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'var(--accent)' }}>
                    {e.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{e.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{e.email} · {e.domain?.name}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => verify(e.id, true)} disabled={busy === e.id}
                      className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 disabled:opacity-60">✓</button>
                    <button onClick={() => verify(e.id, false)} disabled={busy === e.id}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-60">✗</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>🚩 Recent Anti-Fraud Flags</h3>
          {data.recentFlags.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No fraud flags 🎉</p>
          ) : (
            <div className="space-y-2">
              {data.recentFlags.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <span className={`text-xs px-2 py-1 rounded-lg font-semibold flex-shrink-0 ${SEVERITY_STYLE[f.severity] ?? 'bg-slate-100 text-slate-600'}`}>{f.severity}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{f.eventType.replace(/_/g, ' ')}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Risk: {(f.score * 100).toFixed(0)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>📊 Domain Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.domainStats.map(d => (
            <div key={d.id} className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-2)' }}>
              <div className="text-2xl mb-1">{d.icon}</div>
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{d.name}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{d.expertCount} experts</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.consultationCount} questions</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Users ───────────────────────────────────────────────────────────

function UsersSection() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState('');
  const [inputQ, setInputQ] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&page=${page}`);
    if (res.ok) {
      const json = await res.json();
      setRows(json.users ?? []);
      setPages(json.pages ?? 1);
    }
  }, [q, page]);

  useEffect(() => { load(); }, [load]);

  async function patchUser(userId: string, data: Record<string, unknown>) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, ...data }) });
    load();
  }

  async function deleteUser(id: string, name: string) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Users</h2>
      <form onSubmit={e => { e.preventDefault(); setQ(inputQ); setPage(1); }} className="flex gap-2">
        <input
          value={inputQ}
          onChange={e => setInputQ(e.target.value)}
          placeholder="Search name or email…"
          className="flex-1 px-3 py-2 rounded-xl text-sm"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
        <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>Search</button>
      </form>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Name', 'Email', 'Role', 'Active', 'Joined', 'Consultations', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={e => patchUser(u.id, { role: e.target.value })}
                    className={`text-xs px-2 py-1 rounded-lg font-semibold ${ROLE_STYLE[u.role] ?? ''}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    <option value="user">user</option>
                    <option value="expert">expert</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => patchUser(u.id, { isActive: !u.isActive })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {u.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(u.createdAt)}</td>
                <td className="px-4 py-3 text-center" style={{ color: 'var(--text-secondary)' }}>{u._count.consultations}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteUser(u.id, u.name)} className="px-2 py-1 rounded-lg text-xs bg-red-100 text-red-600 hover:bg-red-200">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} onPage={p => setPage(p)} />
    </div>
  );
}

// ─── Section: Experts ─────────────────────────────────────────────────────────

function ExpertsSection() {
  const [rows, setRows] = useState<ExpertRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [verified, setVerified] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/experts?verified=${verified}&page=${page}`);
    if (res.ok) {
      const json = await res.json();
      setRows(json.experts ?? []);
      setPages(json.pages ?? 1);
    }
  }, [verified, page]);

  useEffect(() => { load(); }, [load]);

  async function patch(expertId: string, data: Record<string, unknown>) {
    await fetch('/api/admin/experts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expertId, ...data }) });
    load();
  }

  async function del(id: string, name: string) {
    if (!window.confirm(`Delete expert "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/experts?id=${id}`, { method: 'DELETE' });
    load();
  }

  const tabs = [{ label: 'All', value: '' }, { label: 'Pending', value: 'false' }, { label: 'Verified', value: 'true' }];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Experts</h2>
      <div className="flex gap-1">
        {tabs.map(t => (
          <button key={t.value} onClick={() => { setVerified(t.value); setPage(1); }}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={verified === t.value ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Name', 'Domain', 'Rating', 'Wins', 'Verified', 'Available', 'Subs', 'Joined', ''].map(h => (
                <th key={h} className="px-3 py-3 text-left font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(e => (
              <tr key={e.id} style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                <td className="px-3 py-3">
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{e.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.email}</div>
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{e.domain?.name ?? '—'}</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{e.rating.toFixed(1)}</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{e.totalWins}</td>
                <td className="px-3 py-3">
                  <button onClick={() => patch(e.id, { isVerified: !e.isVerified })}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${e.isVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {e.isVerified ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <button onClick={() => patch(e.id, { isAvailable: !e.isAvailable })}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${e.isAvailable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {e.isAvailable ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-3 py-3 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>{e._count.submissions}</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(e.createdAt)}</td>
                <td className="px-3 py-3">
                  <button onClick={() => del(e.id, e.name)} className="px-2 py-1 rounded-lg text-xs bg-red-100 text-red-600 hover:bg-red-200">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No experts found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} onPage={p => setPage(p)} />
    </div>
  );
}

// ─── Section: Consultations ───────────────────────────────────────────────────

function ConsultationsSection() {
  const [rows, setRows] = useState<ConsultationRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/consultations?status=${status}&page=${page}`);
    if (res.ok) {
      const json = await res.json();
      setRows(json.consultations ?? []);
      setPages(json.pages ?? 1);
    }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  async function patch(consultationId: string, data: Record<string, unknown>) {
    await fetch('/api/admin/consultations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consultationId, ...data }) });
    load();
  }

  async function del(id: string, title: string) {
    if (!window.confirm(`Delete consultation "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/consultations?id=${id}`, { method: 'DELETE' });
    load();
  }

  const statusTabs = ['', 'pending', 'analyzing', 'active', 'examining', 'completed', 'cancelled'];
  const statusLabels: Record<string, string> = { '': 'All' };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Consultations</h2>
      <div className="flex flex-wrap gap-1">
        {statusTabs.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
            style={status === s ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
            {statusLabels[s] ?? s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Title', 'User', 'Domain', 'Status', 'Public', 'Subs', 'Prize', 'Date', ''].map(h => (
                <th key={h} className="px-3 py-3 text-left font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                <td className="px-3 py-3 max-w-xs">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</div>
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{c.user.name}</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{c.domain?.name ?? '—'}</td>
                <td className="px-3 py-3">
                  <select
                    value={c.status}
                    onChange={e => patch(c.id, { status: e.target.value })}
                    className={`text-xs px-2 py-1 rounded-lg font-semibold capitalize ${STATUS_STYLE[c.status] ?? 'bg-slate-100 text-slate-600'}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {['pending', 'analyzing', 'routing', 'active', 'examining', 'completed', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3">
                  <button onClick={() => patch(c.id, { isPublic: !c.isPublic })}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${c.isPublic ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {c.isPublic ? 'Public' : 'Private'}
                  </button>
                </td>
                <td className="px-3 py-3 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>{c._count.submissions}</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{c.prizePoints} pts</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(c.createdAt)}</td>
                <td className="px-3 py-3">
                  <button onClick={() => del(c.id, c.title)} className="px-2 py-1 rounded-lg text-xs bg-red-100 text-red-600 hover:bg-red-200">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No consultations found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} onPage={p => setPage(p)} />
    </div>
  );
}

// ─── Section: Anti-Fraud ──────────────────────────────────────────────────────

function FraudSection() {
  const [rows, setRows] = useState<FraudRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState('false');

  const load = useCallback(async () => {
    const resolved = filter === 'all' ? '' : filter;
    const res = await fetch(`/api/admin/fraud?resolved=${resolved}&page=${page}`);
    if (res.ok) {
      const json = await res.json();
      setRows(json.flags ?? []);
      setPages(json.pages ?? 1);
    }
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  async function toggleResolved(flagId: string, resolved: boolean) {
    await fetch('/api/admin/fraud', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flagId, resolved }) });
    load();
  }

  const tabs = [{ label: 'Unresolved', value: 'false' }, { label: 'Resolved', value: 'true' }, { label: 'All', value: 'all' }];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Anti-Fraud</h2>
      <div className="flex gap-1">
        {tabs.map(t => (
          <button key={t.value} onClick={() => { setFilter(t.value); setPage(1); }}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={filter === t.value ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Event Type', 'Severity', 'Risk %', 'Action', 'Expert / User', 'Date', ''].map(h => (
                <th key={h} className="px-3 py-3 text-left font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(f => (
              <tr key={f.id} style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                <td className="px-3 py-3 text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{f.eventType.replace(/_/g, ' ')}</td>
                <td className="px-3 py-3">
                  <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${SEVERITY_STYLE[f.severity] ?? 'bg-slate-100 text-slate-600'}`}>{f.severity}</span>
                </td>
                <td className="px-3 py-3 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{(f.score * 100).toFixed(0)}%</td>
                <td className="px-3 py-3 text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{f.action}</td>
                <td className="px-3 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {(f.expertId ?? f.userId ?? '—').substring(0, 8)}…
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(f.createdAt)}</td>
                <td className="px-3 py-3">
                  <button onClick={() => toggleResolved(f.id, !f.resolved)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${f.resolved ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {f.resolved ? 'Unresolve' : 'Resolve'}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No flags found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} onPage={p => setPage(p)} />
    </div>
  );
}

// ─── Section: Domains ─────────────────────────────────────────────────────────

function DomainsSection({ domainStats }: { domainStats: OverviewData['domainStats'] | null }) {
  if (!domainStats) return <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Domains</h2>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Icon', 'Name', 'Experts', 'Consultations'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {domainStats.map(d => (
              <tr key={d.id} style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                <td className="px-4 py-3 text-xl">{d.icon}</td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{d.name}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{d.expertCount}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{d.consultationCount}</td>
              </tr>
            ))}
            {domainStats.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No domains</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────

type Section = 'overview' | 'users' | 'experts' | 'consultations' | 'fraud' | 'domains';

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'experts', label: 'Experts', icon: '🧠' },
  { id: 'consultations', label: 'Consultations', icon: '❓' },
  { id: 'fraud', label: 'Anti-Fraud', icon: '🚩' },
  { id: 'domains', label: 'Domains', icon: '📚' },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [active, setActive] = useState<Section>('overview');
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);

  useEffect(() => {
    fetch('/api/admin').then(r => r.ok ? r.json() : null).then(d => d && setOverviewData(d));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  if (!user || user.email !== 'abbasdemir000@gmail.com') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)' }}>
        <div className="text-4xl mb-2">🔒</div>
        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Access Denied</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This page is restricted to authorized administrators only.</p>
        <Link href="/" className="text-sm underline" style={{ color: 'var(--accent)' }}>← Back to App</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className="flex flex-col flex-shrink-0 w-[220px]" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
        <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="text-sm font-bold" style={{ color: 'var(--accent)' }}>KnowledgeMarket</div>
          <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>Admin</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setActive(n.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
              style={active === n.id
                ? { background: 'var(--accent)', color: '#fff' }
                : { color: 'var(--text-secondary)' }}
            >
              <span>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="px-3 py-2 text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.name}</div>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all" style={{ color: 'var(--text-secondary)' }}>
            ← Back to App
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        {active === 'overview' && <OverviewSection />}
        {active === 'users' && <UsersSection />}
        {active === 'experts' && <ExpertsSection />}
        {active === 'consultations' && <ConsultationsSection />}
        {active === 'fraud' && <FraudSection />}
        {active === 'domains' && <DomainsSection domainStats={overviewData?.domainStats ?? null} />}
      </main>
    </div>
  );
}
