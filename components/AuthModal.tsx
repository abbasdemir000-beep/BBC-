'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

interface Props {
  onClose: () => void;
}

type Mode = 'login' | 'register';

export default function AuthModal({ onClose }: Props) {
  const { refresh } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'user' as 'user' | 'expert',
    bio: '', domainSlug: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      await refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
              <p className="text-sm opacity-80 mt-0.5">{mode === 'login' ? 'Welcome back!' : 'Join the knowledge marketplace'}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>

          <div className="flex gap-1 mt-4 bg-white/20 rounded-xl p-1">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-white text-brand-700 shadow' : 'text-white/80 hover:text-white'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && field('name', 'Full Name', 'text', 'Your display name')}
          {field('email', 'Email Address', 'email', 'you@example.com')}
          {field('password', 'Password', 'password', '••••••••')}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Account Type</label>
                <div className="flex gap-3">
                  {(['user', 'expert'] as const).map(r => (
                    <label key={r} className={`flex-1 flex items-center justify-center gap-2 border-2 rounded-xl p-3 cursor-pointer transition-all ${form.role === r ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      <input type="radio" name="role" value={r} checked={form.role === r} onChange={() => setForm(f => ({ ...f, role: r }))} className="sr-only" />
                      <span>{r === 'user' ? '🙋' : '🧠'}</span>
                      <span className="text-sm font-semibold capitalize">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {form.role === 'expert' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Domain Slug</label>
                    <input
                      value={form.domainSlug}
                      onChange={e => setForm(f => ({ ...f, domainSlug: e.target.value }))}
                      placeholder="e.g. medicine, law, computer-science"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  {field('bio', 'Bio (optional)', 'text', 'Brief professional description')}
                </>
              )}
            </>
          )}

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-brand-600 hover:to-purple-700 disabled:opacity-60 transition-all shadow-sm"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
