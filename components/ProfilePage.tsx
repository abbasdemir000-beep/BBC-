'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { uploadFile } from '@/lib/firebase/storage';

interface ProfileData {
  user: { id: string; name: string; email: string; role: string; bio: string | null; avatar: string | null; reputation: number; appLanguage: string; createdAt: string };
  expert: { id: string; name: string; bio: string; avatar: string | null; yearsExperience: number; hourlyRate: number; rating: number; totalReviews: number; totalWins: number; isAvailable: boolean; isVerified: boolean; domain?: { id: string; name: string; icon: string; slug: string } } | null;
  stats: { questions: number; answers: number; examPasses: number };
}

export default function ProfilePage() {
  const { user, expert } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', yearsExperience: 0, hourlyRate: 0, isAvailable: true });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((d: ProfileData) => {
        setData(d);
        setForm({
          name: d.user.name,
          bio: d.expert?.bio ?? d.user.bio ?? '',
          yearsExperience: d.expert?.yearsExperience ?? 0,
          hourlyRate: d.expert?.hourlyRate ?? 0,
          isAvailable: d.expert?.isAvailable ?? true,
        });
      });
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file, `avatars/${data.user.id}`);
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: url }),
      });
      setData(prev => prev ? { ...prev, user: { ...prev.user, avatar: url }, expert: prev.expert ? { ...prev.expert, avatar: url } : null } : null);
    } catch {
      alert('Failed to upload image. Check Firebase Storage rules.');
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        user: { ...prev.user, name: form.name, bio: form.bio },
        expert: prev.expert ? { ...prev.expert, name: form.name, bio: form.bio, yearsExperience: form.yearsExperience, hourlyRate: form.hourlyRate, isAvailable: form.isAvailable } : null,
      };
    });
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!data) return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-32 rounded-2xl" style={{ background: 'var(--surface-2)' }} />
      <div className="h-48 rounded-2xl" style={{ background: 'var(--surface-2)' }} />
    </div>
  );

  const avatarUrl = data.expert?.avatar ?? data.user.avatar;
  const displayName = data.user.name;
  const roleLabel = data.user.role === 'expert' ? '🧠 Expert' : data.user.role === 'admin' ? '🛡️ Admin' : '👤 User';

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <div className="card overflow-hidden p-0">
        <div className="h-24" style={{ background: 'linear-gradient(135deg,#c2714f,#d4a853)' }} />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 flex items-center justify-center text-white text-3xl font-black"
                style={{ background: 'linear-gradient(135deg,#c2714f,#d4a853)', ringColor: 'var(--surface)' }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  : displayName.charAt(0).toUpperCase()
                }
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                style={{ background: 'rgba(0,0,0,0.55)' }}
                title="Change photo"
              >
                {uploadingAvatar ? (
                  <span className="text-white text-xs">...</span>
                ) : (
                  <span className="text-white text-xl">📷</span>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex items-center gap-2">
              {saved && (
                <span className="text-xs px-3 py-1.5 rounded-xl font-medium"
                  style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>✓ Saved</span>
              )}
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-4 py-2">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary text-sm px-4 py-2">✏️ Edit</button>
              )}
            </div>
          </div>

          {editing ? (
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input text-xl font-bold mb-1"
              maxLength={80}
            />
          ) : (
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{displayName}</h1>
          )}

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-sm px-2.5 py-1 rounded-lg font-medium"
              style={{ background: 'rgba(194,113,79,0.1)', color: 'var(--accent)' }}>{roleLabel}</span>
            {data.expert?.isVerified && (
              <span className="text-xs px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>✓ Verified</span>
            )}
            {data.expert?.domain && (
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {data.expert.domain.icon} {data.expert.domain.name}
              </span>
            )}
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{data.user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Reputation', value: data.user.reputation, icon: '⭐' },
          { label: data.user.role === 'expert' ? 'Answers' : 'Questions', value: data.user.role === 'expert' ? data.stats.answers : data.stats.questions, icon: data.user.role === 'expert' ? '✍️' : '❓' },
          { label: data.user.role === 'expert' ? 'Exam Passes' : 'Questions', value: data.user.role === 'expert' ? data.stats.examPasses : data.stats.questions, icon: '🎯' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bio */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>About</h2>
        {editing ? (
          <textarea
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={4} maxLength={500}
            placeholder="Write a short bio about yourself…"
            className="input resize-none"
          />
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {form.bio || <span style={{ color: 'var(--text-muted)' }}>No bio yet. Click Edit to add one.</span>}
          </p>
        )}
      </div>

      {/* Expert-specific fields */}
      {data.user.role === 'expert' && data.expert && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Expert Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Years of Experience</label>
              {editing ? (
                <input type="number" min={0} max={60} value={form.yearsExperience}
                  onChange={e => setForm(f => ({ ...f, yearsExperience: Number(e.target.value) }))}
                  className="input" />
              ) : (
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{data.expert.yearsExperience} years</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Hourly Rate (USD)</label>
              {editing ? (
                <input type="number" min={0} value={form.hourlyRate}
                  onChange={e => setForm(f => ({ ...f, hourlyRate: Number(e.target.value) }))}
                  className="input" />
              ) : (
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>${data.expert.hourlyRate}/hr</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Rating</label>
              <p className="text-sm font-semibold" style={{ color: '#d4a853' }}>⭐ {data.expert.rating.toFixed(1)} ({data.expert.totalReviews} reviews)</p>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Availability</label>
              {editing ? (
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                  className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                  style={form.isAvailable
                    ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }
                    : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {form.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                </button>
              ) : (
                <p className="text-sm font-semibold" style={{ color: data.expert.isAvailable ? '#34d399' : 'var(--text-muted)' }}>
                  {data.expert.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Account info */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Account</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Email</span>
            <p className="font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{data.user.email}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Member since</span>
            <p className="font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {new Date(data.user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
