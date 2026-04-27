'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLang } from '@/lib/i18n/LanguageContext';
import { type Lang } from '@/lib/i18n/translations';

const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'ku', label: 'کوردی', flag: '🏳️' },
];

export default function ProfileSettings() {
  const { user, refresh } = useAuth();
  const { lang, setLang } = useLang();

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [appLanguage, setAppLanguage] = useState(user?.appLanguage ?? 'en');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return (
    <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
      <div className="text-4xl mb-3">🔒</div>
      <p className="font-medium">Sign in to view your profile settings.</p>
    </div>
  );

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setProfileMsg(null);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, appLanguage }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Update failed');
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setLang(appLanguage as Lang);
      await refresh();
    } catch (err) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update' });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Passwords do not match' }); return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return;
    }
    setChangingPw(true); setPwMsg(null);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Password change failed');
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Profile Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage your account details and preferences
        </p>
      </div>

      {/* Avatar & name preview */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
          {(name || user.name).charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{name || user.name}</div>
          <div className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{user.role}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
        </div>
        {(user.reputation ?? 0) > 0 && (
          <div className="ms-auto text-right">
            <div className="text-xl font-black" style={{ color: 'var(--accent)' }}>
              {user.reputation?.toLocaleString()}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>reputation</div>
          </div>
        )}
      </div>

      {/* Profile form */}
      <form onSubmit={saveProfile} className="card space-y-5">
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>General Information</h2>

        <div>
          <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            Display Name
          </label>
          <input className="input" value={name} onChange={e => setName(e.target.value)}
            required minLength={2} maxLength={100} placeholder="Your name" />
        </div>

        <div>
          <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            Bio
          </label>
          <textarea className="input resize-none" rows={3} value={bio}
            onChange={e => setBio(e.target.value)} maxLength={500}
            placeholder="Tell others about yourself…" />
          <div className="text-xs mt-1 text-end" style={{ color: 'var(--text-muted)' }}>{bio.length}/500</div>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>
            Interface Language
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map(l => (
              <button key={l.value} type="button" onClick={() => setAppLanguage(l.value)}
                className="py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={appLanguage === l.value ? {
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff',
                  border: '1px solid transparent',
                } : {
                  background: 'var(--surface-2)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}>
                <span>{l.flag}</span> {l.label}
              </button>
            ))}
          </div>
        </div>

        {profileMsg && (
          <div className="rounded-xl p-3 text-sm"
            style={profileMsg.type === 'success' ? {
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399',
            } : {
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171',
            }}>
            {profileMsg.text}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>

      {/* Password form */}
      <form onSubmit={changePassword} className="card space-y-5">
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Change Password</h2>

        <div>
          <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            Current Password
          </label>
          <input type="password" className="input" value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)} required placeholder="••••••••" />
        </div>
        <div>
          <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            New Password
          </label>
          <input type="password" className="input" value={newPassword}
            onChange={e => setNewPassword(e.target.value)} required minLength={6} placeholder="Min. 6 characters" />
        </div>
        <div>
          <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            Confirm New Password
          </label>
          <input type="password" className="input" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repeat new password" />
        </div>

        {pwMsg && (
          <div className="rounded-xl p-3 text-sm"
            style={pwMsg.type === 'success' ? {
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399',
            } : {
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171',
            }}>
            {pwMsg.text}
          </div>
        )}

        <button type="submit" disabled={changingPw} className="btn-secondary w-full py-3 disabled:opacity-60">
          {changingPw ? 'Updating…' : '🔑 Change Password'}
        </button>
      </form>
    </div>
  );
}
