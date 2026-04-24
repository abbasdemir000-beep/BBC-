'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

type AdminTab = 'overview' | 'users' | 'experts' | 'fraud';

interface Overview {
  totalUsers: number; totalExperts: number; totalConsultations: number; totalSubmissions: number;
  pendingVerifications: Array<{ id: string; name: string; email: string; bio?: string; yearsExperience?: number; domain?: { name: string }; createdAt: string }>;
  recentFlags: Array<{ id: string; eventType: string; severity: string; score: number; action: string; resolved: boolean; createdAt: string; expertId?: string; userId?: string }>;
  domainStats: Array<{ id: string; name: string; slug: string; icon: string; color: string; expertCount: number; consultationCount: number }>;
}

interface User { id: string; name: string; email: string; role: string; isActive: boolean; reputation: number; createdAt: string }
interface Expert { id: string; name: string; email: string; isVerified: boolean; isAvailable: boolean; rating: number; domain?: { name: string }; yearsExperience: number; createdAt: string }

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && user.role !== 'admin') router.push('/');
  }, [user, loading, router]);

  const loadOverview = useCallback(async () => {
    const res = await fetch('/api/admin');
    if (res.ok) setOverview(await res.json());
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) { const d = await res.json(); setUsers(d.users ?? []); }
  }, []);

  const loadExperts = useCallback(async () => {
    const res = await fetch('/api/admin/experts');
    if (res.ok) { const d = await res.json(); setExperts(d.experts ?? []); }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    setLoadingData(true);
    Promise.all([loadOverview(), loadUsers(), loadExperts()]).finally(() => setLoadingData(false));
  }, [user, loadOverview, loadUsers, loadExperts]);

  async function verifyExpert(expertId: string, verified: boolean) {
    setBusy(expertId);
    await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expertId, verified }) });
    await Promise.all([loadOverview(), loadExperts()]);
    setBusy(null);
  }

  async function toggleUser(userId: string, isActive: boolean) {
    setBusy(userId);
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, isActive }) });
    await loadUsers();
    setBusy(null);
  }

  async function changeUserRole(userId: string, role: string) {
    setBusy(userId + role);
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role }) });
    await loadUsers();
    setBusy(null);
  }

  async function resolveFlag(flagId: string) {
    setBusy(flagId);
    await fetch('/api/admin/fraud', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flagId, resolved: true }) });
    await loadOverview();
    setBusy(null);
  }

  if (loading || (!loading && !user)) return null;
  if (user?.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Admin Access Required</h1>
        <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          Go Home
        </button>
      </div>
    </div>
  );

  const SEVERITY: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600', medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700', critical: 'bg-red-200 text-red-900 font-bold',
  };

  const TABS: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: `Users (${users.length})`, icon: '👥' },
    { id: 'experts', label: `Experts (${experts.length})`, icon: '🧠' },
    { id: 'fraud', label: `Fraud (${overview?.recentFlags.filter(f => !f.resolved).length ?? 0})`, icon: '🚩' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 flex items-center gap-4 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <button onClick={() => router.push('/')} className="p-2 rounded-xl transition-colors" style={{ color: 'var(--text-secondary)', background: 'var(--surface-2)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>⚙</div>
        <div>
          <h1 className="font-bold text-sm">Admin Panel</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Platform management</p>
        </div>
        <div className="ms-auto flex gap-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={tab === t.id
                ? { background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }
                : { color: 'var(--text-secondary)', border: '1px solid transparent' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {loadingData ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl" style={{ background: 'var(--surface)' }} />)}
          </div>
        ) : (
          <>
            {/* ── Overview ── */}
            {tab === 'overview' && overview && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Users', value: overview.totalUsers, icon: '👥', grad: 'from-blue-500 to-blue-600' },
                    { label: 'Experts', value: overview.totalExperts, icon: '🧠', grad: 'from-purple-500 to-purple-600' },
                    { label: 'Consultations', value: overview.totalConsultations, icon: '❓', grad: 'from-green-500 to-green-600' },
                    { label: 'Submissions', value: overview.totalSubmissions, icon: '📝', grad: 'from-amber-500 to-amber-600' },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-xl flex-shrink-0`}>{s.icon}</div>
                      <div><div className="text-2xl font-bold">{s.value.toLocaleString()}</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div></div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                      🔍 Pending Verifications
                      {overview.pendingVerifications.length > 0 && (
                        <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{overview.pendingVerifications.length}</span>
                      )}
                    </h2>
                    {overview.pendingVerifications.length === 0 ? (
                      <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>All experts verified ✓</p>
                    ) : (
                      <div className="space-y-2">
                        {overview.pendingVerifications.map(e => (
                          <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>{e.name.charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{e.name}</div>
                              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{e.email} · {e.domain?.name ?? 'No domain'}</div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => verifyExpert(e.id, true)} disabled={busy === e.id}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 disabled:opacity-50 transition-all">✓</button>
                              <button onClick={() => verifyExpert(e.id, false)} disabled={busy === e.id}
                                className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50 transition-all" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>✗</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h2 className="font-semibold mb-4">🚩 Recent Fraud Flags</h2>
                    {overview.recentFlags.length === 0 ? (
                      <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No fraud flags 🎉</p>
                    ) : (
                      <div className="space-y-2">
                        {overview.recentFlags.slice(0, 8).map(f => (
                          <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                            <span className={`text-xs px-2 py-0.5 rounded-lg flex-shrink-0 ${SEVERITY[f.severity] ?? 'bg-slate-100 text-slate-600'}`}>{f.severity}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate">{f.eventType.replace(/_/g, ' ')}</div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Risk {(f.score * 100).toFixed(0)}% · {f.action}</div>
                            </div>
                            {!f.resolved && (
                              <button onClick={() => resolveFlag(f.id)} disabled={busy === f.id}
                                className="text-xs px-2 py-1 rounded-lg disabled:opacity-50" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>Resolve</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <h2 className="font-semibold mb-4">📊 Domain Statistics</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {overview.domainStats.map(d => (
                      <div key={d.id} className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-2)' }}>
                        <div className="text-2xl mb-1">{d.icon}</div>
                        <div className="text-xs font-semibold truncate">{d.name}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{d.expertCount} experts</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.consultationCount} questions</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Users ── */}
            {tab === 'users' && (
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h2 className="font-semibold">👥 All Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        <th className="px-4 py-3 text-start font-medium">User</th>
                        <th className="px-4 py-3 text-start font-medium">Role</th>
                        <th className="px-4 py-3 text-start font-medium">Reputation</th>
                        <th className="px-4 py-3 text-start font-medium">Joined</th>
                        <th className="px-4 py-3 text-start font-medium">Status</th>
                        <th className="px-4 py-3 text-start font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b transition-colors" style={{ borderColor: 'var(--border)' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>{u.name.charAt(0)}</div>
                              <div><div className="font-medium">{u.name}</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</div></div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <select value={u.role} onChange={e => changeUserRole(u.id, e.target.value)}
                              disabled={busy?.startsWith(u.id)}
                              className="text-xs rounded-lg px-2 py-1 border"
                              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                              <option value="user">user</option>
                              <option value="expert">expert</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono">{u.reputation}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {u.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleUser(u.id, !u.isActive)} disabled={busy === u.id}
                              className="text-xs px-3 py-1 rounded-lg disabled:opacity-50 transition-all"
                              style={u.isActive
                                ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                                : { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                              {u.isActive ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No users found</p>}
                </div>
              </div>
            )}

            {/* ── Experts ── */}
            {tab === 'experts' && (
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h2 className="font-semibold">🧠 All Experts ({experts.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        <th className="px-4 py-3 text-start font-medium">Expert</th>
                        <th className="px-4 py-3 text-start font-medium">Domain</th>
                        <th className="px-4 py-3 text-start font-medium">Rating</th>
                        <th className="px-4 py-3 text-start font-medium">Exp.</th>
                        <th className="px-4 py-3 text-start font-medium">Verified</th>
                        <th className="px-4 py-3 text-start font-medium">Available</th>
                        <th className="px-4 py-3 text-start font-medium">Joined</th>
                        <th className="px-4 py-3 text-start font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experts.map(e => (
                        <tr key={e.id} className="border-b transition-colors" style={{ borderColor: 'var(--border)' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>{e.name.charAt(0)}</div>
                              <div><div className="font-medium">{e.name}</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.email}</div></div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs">{e.domain?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-xs font-mono">⭐ {e.rating.toFixed(1)}</td>
                          <td className="px-4 py-3 text-xs">{e.yearsExperience}y</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${e.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {e.isVerified ? '✓ Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${e.isAvailable ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                              {e.isAvailable ? 'Online' : 'Offline'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => verifyExpert(e.id, !e.isVerified)} disabled={busy === e.id}
                              className="text-xs px-3 py-1 rounded-lg disabled:opacity-50 transition-all"
                              style={e.isVerified
                                ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                                : { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                              {e.isVerified ? 'Revoke' : 'Verify'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {experts.length === 0 && <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No experts found</p>}
                </div>
              </div>
            )}

            {/* ── Fraud ── */}
            {tab === 'fraud' && overview && (
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h2 className="font-semibold">🚩 All Fraud Flags ({overview.recentFlags.length})</h2>
                </div>
                {overview.recentFlags.length === 0 ? (
                  <p className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>No fraud flags detected 🎉</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                          <th className="px-4 py-3 text-start font-medium">Severity</th>
                          <th className="px-4 py-3 text-start font-medium">Type</th>
                          <th className="px-4 py-3 text-start font-medium">Risk Score</th>
                          <th className="px-4 py-3 text-start font-medium">Action</th>
                          <th className="px-4 py-3 text-start font-medium">Status</th>
                          <th className="px-4 py-3 text-start font-medium">Date</th>
                          <th className="px-4 py-3 text-start font-medium">Resolve</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.recentFlags.map(f => (
                          <tr key={f.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-lg ${SEVERITY[f.severity] ?? 'bg-slate-100 text-slate-600'}`}>{f.severity}</span>
                            </td>
                            <td className="px-4 py-3 text-xs font-medium">{f.eventType.replace(/_/g, ' ')}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 rounded-full bg-slate-200">
                                  <div className="h-full rounded-full" style={{ width: `${f.score * 100}%`, background: f.score > 0.7 ? '#ef4444' : f.score > 0.4 ? '#f59e0b' : '#22c55e' }} />
                                </div>
                                <span className="text-xs font-mono">{(f.score * 100).toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs">{f.action}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${f.resolved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {f.resolved ? 'Resolved' : 'Open'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              {!f.resolved && (
                                <button onClick={() => resolveFlag(f.id)} disabled={busy === f.id}
                                  className="text-xs px-3 py-1 rounded-lg disabled:opacity-50 transition-all"
                                  style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                                  Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
