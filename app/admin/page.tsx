'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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
  id: string; name: string; email: string; role: string;
  isActive: boolean; createdAt: string; _count: { consultations: number };
}

interface ExpertRow {
  id: string; name: string; email: string; rating: number; totalWins: number;
  isVerified: boolean; isAvailable: boolean; createdAt: string;
  domain: { name: string } | null; _count: { submissions: number };
}

interface ConsultationRow {
  id: string; title: string; status: string; isPublic: boolean;
  prizePoints: number; createdAt: string;
  user: { name: string; email: string };
  domain: { name: string } | null; _count: { submissions: number };
}

interface FraudRow {
  id: string; eventType: string; severity: string; score: number;
  action: string; resolved: boolean;
  expertId: string | null; userId: string | null; createdAt: string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

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

function fmt(d: string) { return new Date(d).toLocaleDateString(); }

// ─── Pager ────────────────────────────────────────────────────────────────────

function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-2 mt-4 justify-end">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1}
        className="px-3 py-1 rounded-lg text-sm disabled:opacity-40 bg-slate-100 text-slate-600 hover:bg-slate-200">Prev</button>
      <span className="text-sm text-slate-400">{page} / {pages}</span>
      <button onClick={() => onPage(page + 1)} disabled={page >= pages}
        className="px-3 py-1 rounded-lg text-sm disabled:opacity-40 bg-slate-100 text-slate-600 hover:bg-slate-200">Next</button>
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
    await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expertId, verified }) });
    setBusy(null); load();
  }

  if (!data) return <div className="p-8 space-y-4 animate-pulse">{[1,2,3].map(i=><div key={i} className="h-24 rounded-2xl bg-slate-100"/>)}</div>;

  const statCards = [
    { label: 'Total Users', value: data.totalUsers, icon: '👥' },
    { label: 'Total Experts', value: data.totalExperts, icon: '🧠' },
    { label: 'Consultations', value: data.totalConsultations, icon: '❓' },
    { label: 'Submissions', value: data.totalSubmissions, icon: '📝' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            🔍 Pending Verifications
            {data.pendingVerifications.length > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{data.pendingVerifications.length}</span>
            )}
          </h3>
          {data.pendingVerifications.length === 0
            ? <p className="text-sm text-slate-400 text-center py-4">All experts verified ✓</p>
            : <div className="space-y-2">{data.pendingVerifications.map(e => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{e.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-700 truncate">{e.name}</div>
                    <div className="text-xs text-slate-400 truncate">{e.email} · {e.domain?.name}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => verify(e.id, true)} disabled={busy===e.id} className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 disabled:opacity-60">✓</button>
                    <button onClick={() => verify(e.id, false)} disabled={busy===e.id} className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-60">✗</button>
                  </div>
                </div>
              ))}</div>
          }
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-3">🚩 Recent Anti-Fraud Flags</h3>
          {data.recentFlags.length === 0
            ? <p className="text-sm text-slate-400 text-center py-4">No fraud flags 🎉</p>
            : <div className="space-y-2">{data.recentFlags.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <span className={`text-xs px-2 py-1 rounded-lg font-semibold flex-shrink-0 ${SEVERITY_STYLE[f.severity]??'bg-slate-100 text-slate-600'}`}>{f.severity}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-700 truncate">{f.eventType.replace(/_/g,' ')}</div>
                    <div className="text-xs text-slate-400">Risk: {(f.score*100).toFixed(0)}%</div>
                  </div>
                </div>
              ))}</div>
          }
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-700 mb-3">📊 Domain Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.domainStats.map(d => (
            <div key={d.id} className="p-3 rounded-xl bg-slate-50 text-center">
              <div className="text-2xl mb-1">{d.icon}</div>
              <div className="text-xs font-semibold text-slate-700 truncate">{d.name}</div>
              <div className="text-xs text-slate-400 mt-1">{d.expertCount} experts</div>
              <div className="text-xs text-slate-400">{d.consultationCount} questions</div>
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
    if (res.ok) { const j = await res.json(); setRows(j.users??[]); setPages(j.pages??1); }
  }, [q, page]);

  useEffect(() => { load(); }, [load]);

  async function patch(userId: string, data: Record<string, unknown>) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, ...data }) });
    load();
  }

  async function del(id: string, name: string) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' }); load();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Users</h2>
      <form onSubmit={e=>{e.preventDefault();setQ(inputQ);setPage(1);}} className="flex gap-2">
        <input value={inputQ} onChange={e=>setInputQ(e.target.value)} placeholder="Search name or email…"
          className="flex-1 px-3 py-2 rounded-xl text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-indigo-400"/>
        <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600">Search</button>
      </form>
      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50">
            {['Name','Email','Role','Active','Joined','Consultations',''].map(h=>(
              <th key={h} className="px-4 py-3 text-left font-semibold text-xs text-slate-400">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map(u=>(
              <tr key={u.id} className="border-t border-slate-100 bg-white hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-700">{u.name}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <select value={u.role} onChange={e=>patch(u.id,{role:e.target.value})}
                    className={`text-xs px-2 py-1 rounded-lg font-semibold border-none cursor-pointer ${ROLE_STYLE[u.role]??''}`}>
                    <option value="user">user</option>
                    <option value="expert">expert</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={()=>patch(u.id,{isActive:!u.isActive})}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${u.isActive?'bg-green-100 text-green-700':'bg-slate-100 text-slate-500'}`}>
                    {u.isActive?'Active':'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{fmt(u.createdAt)}</td>
                <td className="px-4 py-3 text-center text-slate-500">{u._count.consultations}</td>
                <td className="px-4 py-3">
                  <button onClick={()=>del(u.id,u.name)} className="px-2 py-1 rounded-lg text-xs bg-red-100 text-red-600 hover:bg-red-200">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length===0&&<tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No users found</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} onPage={setPage}/>
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
    if (res.ok) { const j = await res.json(); setRows(j.experts??[]); setPages(j.pages??1); }
  }, [verified, page]);

  useEffect(() => { load(); }, [load]);

  async function patch(expertId: string, data: Record<string, unknown>) {
    await fetch('/api/admin/experts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expertId, ...data }) });
    load();
  }

  async function del(id: string, name: string) {
    if (!window.confirm(`Delete expert "${name}"?`)) return;
    await fetch(`/api/admin/experts?id=${id}`, { method: 'DELETE' }); load();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Experts</h2>
      <div className="flex gap-1">
        {[{label:'All',value:''},{label:'Pending',value:'false'},{label:'Verified',value:'true'}].map(t=>(
          <button key={t.value} onClick={()=>{setVerified(t.value);setPage(1);}}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${verified===t.value?'bg-indigo-500 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50">
            {['Name','Domain','Rating','Wins','Verified','Available','Subs','Joined',''].map(h=>(
              <th key={h} className="px-3 py-3 text-left font-semibold text-xs text-slate-400">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map(e=>(
              <tr key={e.id} className="border-t border-slate-100 bg-white hover:bg-slate-50">
                <td className="px-3 py-3">
                  <div className="font-medium text-slate-700">{e.name}</div>
                  <div className="text-xs text-slate-400">{e.email}</div>
                </td>
                <td className="px-3 py-3 text-xs text-slate-500">{e.domain?.name??'—'}</td>
                <td className="px-3 py-3 text-xs text-slate-500">{e.rating.toFixed(1)}</td>
                <td className="px-3 py-3 text-xs text-slate-500">{e.totalWins}</td>
                <td className="px-3 py-3">
                  <button onClick={()=>patch(e.id,{isVerified:!e.isVerified})}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${e.isVerified?'bg-green-100 text-green-700':'bg-slate-100 text-slate-500'}`}>
                    {e.isVerified?'Yes':'No'}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <button onClick={()=>patch(e.id,{isAvailable:!e.isAvailable})}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${e.isAvailable?'bg-green-100 text-green-700':'bg-slate-100 text-slate-500'}`}>
                    {e.isAvailable?'Yes':'No'}
                  </button>
                </td>
                <td className="px-3 py-3 text-xs text-center text-slate-500">{e._count.submissions}</td>
                <td className="px-3 py-3 text-xs text-slate-400">{fmt(e.createdAt)}</td>
                <td className="px-3 py-3">
                  <button onClick={()=>del(e.id,e.name)} className="px-2 py-1 rounded-lg text-xs bg-red-100 text-red-600 hover:bg-red-200">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length===0&&<tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">No experts found</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} onPage={setPage}/>
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
    if (res.ok) { const j = await res.json(); setRows(j.consultations??[]); setPages(j.pages??1); }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  async function patch(consultationId: string, data: Record<string, unknown>) {
    await fetch('/api/admin/consultations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consultationId, ...data }) });
    load();
  }

  async function del(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admin/consultations?id=${id}`, { method: 'DELETE' }); load();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Consultations</h2>
      <div className="flex flex-wrap gap-1">
        {['','pending','analyzing','active','examining','completed','cancelled'].map(s=>(
          <button key={s} onClick={()=>{setStatus(s);setPage(1);}}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${status===s?'bg-indigo-500 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {s||'All'}
          </button>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50">
            {['Title','User','Domain','Status','Public','Subs','Prize','Date',''].map(h=>(
              <th key={h} className="px-3 py-3 text-left font-semibold text-xs text-slate-400">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map(c=>(
              <tr key={c.id} className="border-t border-slate-100 bg-white hover:bg-slate-50">
                <td className="px-3 py-3 max-w-xs"><div className="text-sm font-medium text-slate-700 truncate">{c.title}</div></td>
                <td className="px-3 py-3 text-xs text-slate-500">{c.user.name}</td>
                <td className="px-3 py-3 text-xs text-slate-500">{c.domain?.name??'—'}</td>
                <td className="px-3 py-3">
                  <select value={c.status} onChange={e=>patch(c.id,{status:e.target.value})}
                    className={`text-xs px-2 py-1 rounded-lg font-semibold capitalize border-none cursor-pointer ${STATUS_STYLE[c.status]??'bg-slate-100 text-slate-600'}`}>
                    {['pending','analyzing','routing','active','examining','completed','cancelled'].map(s=>(
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3">
                  <button onClick={()=>patch(c.id,{isPublic:!c.isPublic})}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${c.isPublic?'bg-green-100 text-green-700':'bg-slate-100 text-slate-500'}`}>
                    {c.isPublic?'Public':'Private'}
                  </button>
                </td>
                <td className="px-3 py-3 text-xs text-center text-slate-500">{c._count.submissions}</td>
                <td className="px-3 py-3 text-xs text-slate-500">{c.prizePoints}pts</td>
                <td className="px-3 py-3 text-xs text-slate-400">{fmt(c.createdAt)}</td>
                <td className="px-3 py-3">
                  <button onClick={()=>del(c.id,c.title)} className="px-2 py-1 rounded-lg text-xs bg-red-100 text-red-600 hover:bg-red-200">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length===0&&<tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">No consultations found</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} onPage={setPage}/>
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
    const resolved = filter==='all'?'':filter;
    const res = await fetch(`/api/admin/fraud?resolved=${resolved}&page=${page}`);
    if (res.ok) { const j = await res.json(); setRows(j.flags??[]); setPages(j.pages??1); }
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  async function toggle(flagId: string, resolved: boolean) {
    await fetch('/api/admin/fraud', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flagId, resolved }) });
    load();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Anti-Fraud</h2>
      <div className="flex gap-1">
        {[{label:'Unresolved',value:'false'},{label:'Resolved',value:'true'},{label:'All',value:'all'}].map(t=>(
          <button key={t.value} onClick={()=>{setFilter(t.value);setPage(1);}}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${filter===t.value?'bg-indigo-500 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50">
            {['Event Type','Severity','Risk %','Action','Expert / User','Date',''].map(h=>(
              <th key={h} className="px-3 py-3 text-left font-semibold text-xs text-slate-400">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map(f=>(
              <tr key={f.id} className="border-t border-slate-100 bg-white hover:bg-slate-50">
                <td className="px-3 py-3 text-xs font-medium capitalize text-slate-700">{f.eventType.replace(/_/g,' ')}</td>
                <td className="px-3 py-3">
                  <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${SEVERITY_STYLE[f.severity]??'bg-slate-100 text-slate-600'}`}>{f.severity}</span>
                </td>
                <td className="px-3 py-3 text-xs font-medium text-slate-600">{(f.score*100).toFixed(0)}%</td>
                <td className="px-3 py-3 text-xs capitalize text-slate-500">{f.action}</td>
                <td className="px-3 py-3 text-xs font-mono text-slate-400">{(f.expertId??f.userId??'—').substring(0,8)}…</td>
                <td className="px-3 py-3 text-xs text-slate-400">{fmt(f.createdAt)}</td>
                <td className="px-3 py-3">
                  <button onClick={()=>toggle(f.id,!f.resolved)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${f.resolved?'bg-slate-100 text-slate-600 hover:bg-slate-200':'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {f.resolved?'Unresolve':'Resolve'}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length===0&&<tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No flags found</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} onPage={setPage}/>
    </div>
  );
}

// ─── Section: Domains ─────────────────────────────────────────────────────────

function DomainsSection({ stats }: { stats: OverviewData['domainStats'] | null }) {
  if (!stats) return <div className="p-8 text-center text-sm text-slate-400">Loading…</div>;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Domains</h2>
      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50">
            {['Icon','Name','Experts','Consultations'].map(h=>(
              <th key={h} className="px-4 py-3 text-left font-semibold text-xs text-slate-400">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {stats.map(d=>(
              <tr key={d.id} className="border-t border-slate-100 bg-white hover:bg-slate-50">
                <td className="px-4 py-3 text-xl">{d.icon}</td>
                <td className="px-4 py-3 font-medium text-slate-700">{d.name}</td>
                <td className="px-4 py-3 text-slate-500">{d.expertCount}</td>
                <td className="px-4 py-3 text-slate-500">{d.consultationCount}</td>
              </tr>
            ))}
            {stats.length===0&&<tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">No domains</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) { onSuccess(); }
    else { setError('Incorrect password. Please try again.'); setPw(''); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="text-3xl mb-3">🔐</div>
            <h1 className="text-xl font-bold text-slate-800">KnowledgeMarket Admin</h1>
            <p className="text-sm text-slate-400">Restricted Access</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Admin Password</label>
              <input
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Enter password"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading || !pw}
              className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm disabled:opacity-50 transition-colors"
            >
              {loading ? 'Verifying…' : 'Enter Admin Panel'}
            </button>
          </form>
          <div className="text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">← Back to KnowledgeMarket</Link>
          </div>
        </div>
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
  const [authed, setAuthed] = useState<boolean | null>(null); // null = loading
  const [active, setActive] = useState<Section>('overview');
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);

  // Check existing admin cookie on mount
  useEffect(() => {
    fetch('/api/admin/auth')
      .then(r => r.json())
      .then(d => setAuthed(!!d.ok))
      .catch(() => setAuthed(false));
  }, []);

  // Pre-load overview data (for Domains section re-use)
  useEffect(() => {
    if (!authed) return;
    fetch('/api/admin').then(r => r.ok ? r.json() : null).then(d => d && setOverviewData(d));
  }, [authed]);

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthed(false);
  }

  // Loading state
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Password gate
  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />;
  }

  // Dashboard
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="flex flex-col flex-shrink-0 w-[220px] bg-white border-r border-slate-200">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="text-sm font-bold text-indigo-600">KnowledgeMarket</div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">Admin Panel</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActive(n.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${active===n.id?'bg-indigo-500 text-white':'text-slate-600 hover:bg-slate-100'}`}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 space-y-1 border-t border-slate-100">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-all">
            ← Back to App
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all text-left">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        {active==='overview'      && <OverviewSection />}
        {active==='users'         && <UsersSection />}
        {active==='experts'       && <ExpertsSection />}
        {active==='consultations' && <ConsultationsSection />}
        {active==='fraud'         && <FraudSection />}
        {active==='domains'       && <DomainsSection stats={overviewData?.domainStats??null} />}
      </main>
    </div>
  );
}
