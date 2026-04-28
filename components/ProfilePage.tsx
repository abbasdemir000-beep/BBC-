'use client';
import { useState, useRef } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';

export default function ProfilePage() {
  const { t, dir } = useLang();
  const { user, expert, refresh } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [yearsExp, setYearsExp] = useState(expert ? String((expert as unknown as Record<string, unknown>)['yearsExperience'] ?? '') : '');
  const [hourlyRate, setHourlyRate] = useState(expert ? String((expert as unknown as Record<string, unknown>)['hourlyRate'] ?? '') : '');
  const [available, setAvailable] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]" dir={dir}>
        <div className="text-center" style={{ color: 'var(--text-muted)' }}>
          <div className="text-5xl mb-4">🔒</div>
          <p>{t('sign_in')}</p>
        </div>
      </div>
    );
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { uploadProfilePhoto } = await import('@/lib/firebase/storage');
      const url = await uploadProfilePhoto(user!.id, file);
      setAvatarUrl(url);
    } catch {
      // firebase storage not configured — show preview only
      setAvatarUrl(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMessage('');
    try {
      const body: Record<string, unknown> = { name, bio };
      if (avatarUrl) body.avatar = avatarUrl;
      if (expert) {
        body.yearsExperience = Number(yearsExp);
        body.hourlyRate = Number(hourlyRate);
        body.isAvailable = available;
      }
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      await refresh();
      setMessage(t('profile_saved'));
    } catch {
      setMessage('Error saving — please try again');
    } finally {
      setSaving(false);
    }
  }

  const initials = user.name.slice(0, 2).toUpperCase();
  const displayAvatar = avatarUrl ?? (user as unknown as Record<string, unknown>)['avatar'] as string | undefined;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-2xl mx-auto" dir={dir}>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('profile_title')}</h1>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-5">
        <div className="relative">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover"
              style={{ border: '2px solid var(--border)' }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
              style={{ background: 'linear-gradient(135deg,#c2714f,#a85535)' }}
            >
              {initials}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
          <div className="text-sm capitalize mb-3" style={{ color: 'var(--text-muted)' }}>{user.role}</div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary text-xs py-1.5 px-3">
            {t('profile_photo')}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('profile_reputation'), value: user.reputation ?? 0, icon: '⭐' },
          { label: t('profile_answers'), value: (expert as unknown as Record<string, unknown> | null)?.['totalReviews'] ?? 0, icon: '✍️' },
          { label: t('profile_wins'), value: (expert as unknown as Record<string, unknown> | null)?.['wins'] ?? 0, icon: '🏆' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{String(s.value)}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            {t('profile_name')}
          </label>
          <input
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            {t('profile_bio')}
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="..."
          />
        </div>

        {expert && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t('profile_exp_yrs')}
                </label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="60"
                  value={yearsExp}
                  onChange={e => setYearsExp(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t('profile_rate')}
                </label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(e.target.value)}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={e => setAvailable(e.target.checked)}
                className="w-4 h-4 accent-[#c2714f]"
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('profile_available')}</span>
            </label>
          </>
        )}

        {message && (
          <p className="text-sm" style={{ color: message.startsWith('Error') ? '#f87171' : '#34d399' }}>
            {message}
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? '...' : t('profile_save')}
        </button>
      </form>
    </div>
  );
}
