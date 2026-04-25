'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

type Section = 'overview' | 'users' | 'experts' | 'consultations' | 'fraud' | 'domains';

const SECTIONS: { id: Section; icon: string; label: string }[] = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'users', icon: '👥', label: 'Users' },
  { id: 'experts', icon: '🧠', label: 'Experts' },
  { id: 'consultations', icon: '❓', label: 'Consultations' },
  { id: 'fraud', icon: '🚩', label: 'Anti-Fraud' },
  { id: 'domains', icon: '📚', label: 'Domains' },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [section, setSection] = useState<Section>('overview');

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>Loading...</div>;

  if (!user) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', gap: '1rem' }}>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 'bold' }}>Admin Access Required</h1>
      <p style={{ color: 'var(--text-muted)' }}>Please sign in to access the admin panel.</p>
      <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>← Back to App</Link>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: '220px', flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '14px' }}>K</div>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '13px' }}>Admin</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>KnowledgeMarket</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              textAlign: 'left', fontSize: '13px', fontWeight: '500', transition: 'all 0.15s',
              background: section === s.id ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: section === s.id ? 'var(--accent)' : 'var(--text-secondary)',
            }}>
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', space: '8px' }}>
          <Link href="/" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '12px' }}>← Back to App</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: '700' }}>{user.name.charAt(0)}</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {section === 'overview' && <OverviewSection />}
        {section === 'users' && <UsersSection />}
        {section === 'experts' && <ExpertsSection />}
        {section === 'consultations' && <ConsultationsSection />}
        {section === 'fraud' && <FraudSection />}
        {section === 'domains' && <DomainsSection />}
      </main>
    </div>
  );
}

// ─── Sections ───────────────────────────────────────────────────────────────

function OverviewSection() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin');
      if (r.ok) setStats(await r.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function verify(expertId: string, v: boolean) {
    setBusy(expertId);
    try {
      await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expertId, verified: v }) });
      load();
    } catch (e) {
      console.error(e);
    }
    setBusy(null);
  }

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!stats) return <div style={{ padding: '32px', color: 'var(--text-muted)' }}>Failed to load data</div>;

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Overview</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Platform statistics and quick actions</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3b82f6' },
          { label: 'Total Experts', value: stats.totalExperts, icon: '🧠', color: '#8b5cf6' },
          { label: 'Consultations', value: stats.totalConsultations, icon: '❓', color: '#10b981' },
          { label: 'Submissions', value: stats.totalSubmissions, icon: '📝', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card title={`Pending Verifications (${stats.pendingVerifications.length})`} icon="🔍">
          {stats.pendingVerifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>All experts verified ✓</div>
          ) : stats.pendingVerifications.map((e: any) => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface-2)', borderRadius: '10px', marginBottom: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '12px' }}>{e.name.charAt(0)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.email} · {e.domain?.name}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => verify(e.id, true)} disabled={busy === e.id} style={{ padding: '6px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', opacity: busy === e.id ? 0.6 : 1 }}>✓</button>
                <button onClick={() => verify(e.id, false)} disabled={busy === e.id} style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', opacity: busy === e.id ? 0.6 : 1 }}>✗</button>
              </div>
            </div>
          ))}
        </Card>

        <Card title="Recent Anti-Fraud Flags" icon="🚩">
          {stats.recentFlags.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No flags 🎉</div>
          ) : stats.recentFlags.slice(0, 5).map((f: any) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--surface-2)', borderRadius: '10px', marginBottom: '6px' }}>
              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: f.severity === 'critical' ? '#dc2626' : f.severity === 'high' ? '#ef4444' : f.severity === 'medium' ? '#f59e0b' : '#64748b', color: '#fff' }}>{f.severity}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{f.eventType.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Risk: {(f.score * 100).toFixed(0)}%</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card title="Domain Statistics" icon="📚" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {stats.domainStats.slice(0, 12).map((d: any) => (
            <div key={d.id} style={{ padding: '14px', background: 'var(--surface-2)', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{d.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{d.expertCount} experts</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.consultationCount} questions</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/users?page=${p}&q=${q}`);
      if (r.ok) {
        const d = await r.json();
        setUsers(d.users);
        setTotal(d.total);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(page, search); }, [page, search, load]);

  async function updateUser(id: string, role?: string, isActive?: boolean) {
    setBusy(id);
    try {
      await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id, role, isActive }) });
      load(page, search);
    } catch (e) {
      console.error(e);
    }
    setBusy(null);
  }

  async function deleteUser(id: string) {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      load(page, search);
    } catch (e) {
      console.error(e);
    }
  }

  const pages = Math.ceil(total / 25);

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Users</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Manage all platform users</p>

      <div style={{ marginBottom: '20px' }}>
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: '100%', maxWidth: '400px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px' }} />
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>No users found</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Active</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Joined</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Questions</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>{u.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <select value={u.role} onChange={e => updateUser(u.id, e.target.value)} disabled={busy === u.id} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer' }}>
                        <option value="user">User</option>
                        <option value="expert">Expert</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => updateUser(u.id, undefined, !u.isActive)} disabled={busy === u.id} style={{ padding: '4px 10px', borderRadius: '4px', background: u.isActive ? '#10b981' : '#64748b', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{u._count.consultations}</td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => deleteUser(u.id)} style={{ padding: '4px 10px', borderRadius: '4px', background: '#ef4444', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Page {page} of {pages} ({total} total)</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.5 : 1 }}>Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ExpertsSection() {
  const [experts, setExperts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number, f: string) => {
    setLoading(true);
    try {
      const verified = f === 'all' ? '' : f === 'pending' ? 'false' : 'true';
      const r = await fetch(`/api/admin/experts?page=${p}${verified ? `&verified=${verified}` : ''}`);
      if (r.ok) {
        const d = await r.json();
        setExperts(d.experts);
        setTotal(d.total);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(page, filter); }, [page, filter, load]);

  async function updateExpert(id: string, isVerified?: boolean, isAvailable?: boolean) {
    try {
      await fetch('/api/admin/experts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expertId: id, isVerified, isAvailable }) });
      load(page, filter);
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteExpert(id: string) {
    if (!window.confirm('Delete this expert? This cannot be undone.')) return;
    try {
      await fetch(`/api/admin/experts?id=${id}`, { method: 'DELETE' });
      load(page, filter);
    } catch (e) {
      console.error(e);
    }
  }

  const pages = Math.ceil(total / 25);

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Experts</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Manage expert accounts</p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {['all', 'pending', 'verified'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', background: filter === f ? 'var(--accent)' : 'var(--surface)', color: filter === f ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : experts.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>No experts found</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Domain</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Rating</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Wins</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Verified</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Available</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {experts.map((e: any) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>{e.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>{e.email}</td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{e.domain?.name || '-'}</td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{e.rating.toFixed(1)}⭐</td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{e.totalWins}</td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => updateExpert(e.id, !e.isVerified)} style={{ padding: '4px 10px', borderRadius: '4px', background: e.isVerified ? '#10b981' : '#64748b', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                        {e.isVerified ? '✓' : '✗'}
                      </button>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => updateExpert(e.id, undefined, !e.isAvailable)} style={{ padding: '4px 10px', borderRadius: '4px', background: e.isAvailable ? '#10b981' : '#64748b', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                        {e.isAvailable ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => deleteExpert(e.id)} style={{ padding: '4px 10px', borderRadius: '4px', background: '#ef4444', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Page {page} of {pages} ({total} total)</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.5 : 1 }}>Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ConsultationsSection() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const statuses = ['pending', 'analyzing', 'routing', 'active', 'examining', 'judging', 'completed', 'cancelled'];

  const load = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/consultations?page=${p}${s ? `&status=${s}` : ''}`);
      if (r.ok) {
        const d = await r.json();
        setConsultations(d.consultations);
        setTotal(d.total);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(page, statusFilter); }, [page, statusFilter, load]);

  async function updateConsultation(id: string, status?: string, isPublic?: boolean) {
    try {
      await fetch('/api/admin/consultations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consultationId: id, status, isPublic }) });
      load(page, statusFilter);
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteConsultation(id: string) {
    if (!window.confirm('Delete this consultation? This cannot be undone.')) return;
    try {
      await fetch(`/api/admin/consultations?id=${id}`, { method: 'DELETE' });
      load(page, statusFilter);
    } catch (e) {
      console.error(e);
    }
  }

  const pages = Math.ceil(total / 25);

  const statusColors: Record<string, string> = {
    pending: '#f59e0b', analyzing: '#3b82f6', routing: '#8b5cf6', active: '#10b981',
    examining: '#06b6d4', judging: '#f59e0b', completed: '#10b981', cancelled: '#64748b'
  };

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Consultations</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Manage all questions</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => { setStatusFilter(''); setPage(1); }} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', background: statusFilter === '' ? 'var(--accent)' : 'var(--surface)', color: statusFilter === '' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>All</button>
        {statuses.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', background: statusFilter === s ? 'var(--accent)' : 'var(--surface)', color: statusFilter === s ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : consultations.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>No consultations found</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Title</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>User</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Submissions</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Prize</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Public</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: '600', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>{c.user.name}</td>
                    <td style={{ padding: '12px' }}>
                      <select value={c.status} onChange={e => updateConsultation(c.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize' }}>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{c._count.submissions}</td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{c.prizePoints} pts</td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => updateConsultation(c.id, undefined, !c.isPublic)} style={{ padding: '4px 10px', borderRadius: '4px', background: c.isPublic ? '#10b981' : '#64748b', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                        {c.isPublic ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => deleteConsultation(c.id)} style={{ padding: '4px 10px', borderRadius: '4px', background: '#ef4444', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Page {page} of {pages} ({total} total)</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.5 : 1 }}>Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FraudSection() {
  const [flags, setFlags] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('false');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number, f: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/fraud?page=${p}${f !== 'all' ? `&resolved=${f}` : ''}`);
      if (r.ok) {
        const d = await r.json();
        setFlags(d.flags);
        setTotal(d.total);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(page, filter); }, [page, filter, load]);

  async function toggleFlag(id: string, currentResolved: boolean) {
    try {
      await fetch('/api/admin/fraud', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flagId: id, resolved: !currentResolved }) });
      load(page, filter);
    } catch (e) {
      console.error(e);
    }
  }

  const pages = Math.ceil(total / 25);

  const severityColors: Record<string, string> = {
    low: '#64748b', medium: '#f59e0b', high: '#ef4444', critical: '#991b1b'
  };

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Anti-Fraud</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Manage fraud flags and suspicious activities</p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {['false', 'true', 'all'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', background: filter === f ? 'var(--accent)' : 'var(--surface)', color: filter === f ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            {f === 'false' ? 'Unresolved' : f === 'true' ? 'Resolved' : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : flags.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>No flags found</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Severity</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Risk %</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Action</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((f: any) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>{f.eventType.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: severityColors[f.severity], color: '#fff' }}>{f.severity}</span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{(f.score * 100).toFixed(0)}%</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{f.action}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => toggleFlag(f.id, f.resolved)} style={{ padding: '4px 10px', borderRadius: '4px', background: f.resolved ? '#10b981' : '#f59e0b', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                        {f.resolved ? 'Resolved' : 'Resolve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Page {page} of {pages} ({total} total)</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.5 : 1 }}>Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DomainsSection() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin');
        if (r.ok) {
          const d = await r.json();
          setDomains(d.domainStats);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Domains</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Platform domains and categories</p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Icon</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Experts</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Consultations</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((d: any) => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontSize: '20px' }}>{d.icon}</td>
                <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>{d.name}</td>
                <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{d.expertCount}</td>
                <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{d.consultationCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────────────────────

function Card({ title, icon, style, children }: { title: string; icon: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', ...style }}>
      <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}
