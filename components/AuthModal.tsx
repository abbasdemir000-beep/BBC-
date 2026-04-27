'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { LANGUAGES, type Lang } from '@/lib/i18n/translations';
import { useLang } from '@/lib/i18n/LanguageContext';

interface Props { onClose: () => void; }
type Mode = 'login' | 'register';
type Step = 'language' | 'form';

const LANG_OPTIONS: { code: Lang; label: string; native: string; flag: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English',  native: 'English',  flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', label: 'Arabic',   native: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'ku', label: 'Kurdish',  native: 'کوردی',   flag: '🏳️',  dir: 'rtl' },
];

const TEXT_LANG_LABELS: Record<string, string> = {
  en: 'Accept English questions',
  ar: 'Accept Arabic questions',
  ku: 'Accept Kurdish questions',
};

const UI_TEXT: Record<Lang, {
  chooseApp: string; chooseAppSub: string; continue: string;
  signIn: string; register: string; welcome: string; joinUs: string;
  fullName: string; email: string; password: string; accountType: string;
  userDesc: string; expertDesc: string; domain: string; bio: string;
  examLang: string; examLangSub: string; textLangs: string; textLangsSub: string;
  submit: string; signing: string; wait: string; appLang: string; changeLang: string;
}> = {
  en: {
    chooseApp: 'Choose Your Language', chooseAppSub: 'Select your preferred language to continue',
    continue: 'Continue', signIn: 'Sign In', register: 'Register',
    welcome: 'Welcome back', joinUs: 'Join the knowledge marketplace',
    fullName: 'Full Name', email: 'Email Address', password: 'Password',
    accountType: 'Account Type', userDesc: 'Ask questions & get expert answers',
    expertDesc: 'Answer questions & earn rewards',
    domain: 'Specialization Domain', bio: 'Professional Bio',
    examLang: 'Exam Language', examLangSub: 'Language used for your qualification exam',
    textLangs: 'Question Languages', textLangsSub: 'Which language questions will you accept?',
    submit: 'Create Account', signing: 'Signing in…', wait: 'Please wait…',
    appLang: 'App Language', changeLang: 'Change',
  },
  ar: {
    chooseApp: 'اختر لغتك', chooseAppSub: 'اختر لغتك المفضلة للمتابعة',
    continue: 'متابعة', signIn: 'تسجيل الدخول', register: 'إنشاء حساب',
    welcome: 'مرحباً بعودتك', joinUs: 'انضم إلى سوق المعرفة',
    fullName: 'الاسم الكامل', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    accountType: 'نوع الحساب', userDesc: 'اطرح أسئلة واحصل على إجابات',
    expertDesc: 'أجب على الأسئلة واكسب مكافآت',
    domain: 'مجال التخصص', bio: 'السيرة المهنية',
    examLang: 'لغة الامتحان', examLangSub: 'اللغة المستخدمة في امتحان التأهل',
    textLangs: 'لغات الأسئلة', textLangsSub: 'ما لغات الأسئلة التي ستقبلها؟',
    submit: 'إنشاء الحساب', signing: 'جارٍ تسجيل الدخول…', wait: 'يرجى الانتظار…',
    appLang: 'لغة التطبيق', changeLang: 'تغيير',
  },
  ku: {
    chooseApp: 'زمانەکەت هەڵبژێرە', chooseAppSub: 'زمانی دڵخوازت هەڵبژێرە بۆ بەردەوامبوون',
    continue: 'بەردەوام بە', signIn: 'چوونە ژوورەوە', register: 'تۆمارکردن',
    welcome: 'بەخێر بێیتەوە', joinUs: 'بەشداری بازاڕی زانستدا بکە',
    fullName: 'ناوی تەواو', email: 'ئیمەیڵ', password: 'وشەی نهێنی',
    accountType: 'جۆری هەژمار', userDesc: 'پرسیار بکە و وەڵام وەربگرە',
    expertDesc: 'وەڵام بدەرەوە و خەڵات بەدەست بهێنە',
    domain: 'بواری پسپۆڕایەتی', bio: 'ژیاننامەی پیشەیی',
    examLang: 'زمانی تاقیکردنەوە', examLangSub: 'زمانی تاقیکردنەوەی پێشکەوتوو',
    textLangs: 'زمانی پرسیارەکان', textLangsSub: 'کام زمانی پرسیار قبوڵ دەکەیت؟',
    submit: 'هەژمار دروستبکە', signing: 'چوونە ژوورەوە…', wait: 'چاوەڕێبکە…',
    appLang: 'زمانی ئەپ', changeLang: 'گۆڕین',
  },
};

export default function AuthModal({ onClose }: Props) {
  const { refresh } = useAuth();
  const { setLang } = useLang();

  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('language');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appLang, setAppLang] = useState<Lang>('en');

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'user' as 'user' | 'expert',
    bio: '', domainSlug: '',
    examLanguage: 'en' as Lang,
    textLanguages: ['en'] as Lang[],
  });

  const ui = UI_TEXT[appLang];
  const isRTL = LANGUAGES[appLang].dir === 'rtl';

  function selectAppLang(l: Lang) { setAppLang(l); setLang(l); }

  function toggleTextLang(l: Lang) {
    setForm(f => {
      const has = f.textLanguages.includes(l);
      const next = has ? f.textLanguages.filter(x => x !== l) : [...f.textLanguages, l];
      return { ...f, textLanguages: next.length ? next : [l] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { ...form, appLanguage: appLang };
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={onClose}>
      <div className="w-full max-w-md animate-scale-in overflow-hidden"
        style={{ background: 'var(--paper)', border: '1px solid var(--border-medium)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: 'var(--ink)' }}>
          <div>
            <h2 className="font-display text-lg italic font-light" style={{ color: 'var(--paper)' }}>
              {step === 'language' ? ui.chooseApp : (mode === 'login' ? ui.signIn : ui.register)}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(240,237,232,0.55)' }}>
              {step === 'language' ? ui.chooseAppSub : (mode === 'login' ? ui.welcome : ui.joinUs)}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none transition-opacity hover:opacity-60"
            style={{ color: 'var(--paper)' }}>×</button>
        </div>

        {/* Mode tabs */}
        {step === 'form' && (
          <div className="flex" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-3 text-xs uppercase tracking-widest font-medium transition-colors"
                style={mode === m
                  ? { color: 'var(--ink)', borderBottom: '2px solid var(--ink)' }
                  : { color: 'var(--ink-muted)' }}>
                {m === 'login' ? ui.signIn : ui.register}
              </button>
            ))}
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Language step */}
          {step === 'language' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {LANG_OPTIONS.map(l => (
                  <button key={l.code} onClick={() => selectAppLang(l.code)}
                    className="flex flex-col items-center gap-2 p-4 transition-colors"
                    style={appLang === l.code
                      ? { background: 'var(--ink)', color: 'var(--paper)', border: '1px solid var(--ink)' }
                      : { background: 'transparent', color: 'var(--ink-muted)', border: '1px solid var(--border-medium)' }}>
                    <span className="text-3xl">{l.flag}</span>
                    <span className="text-xs font-medium">{l.native}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('form')} className="btn-editorial w-full py-3">
                {ui.continue} →
              </button>
            </div>
          )}

          {/* Form step */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Language badge */}
              <div className="flex items-center justify-between py-2 text-xs"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--ink-muted)' }}>{ui.appLang}</span>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--ink)' }}>
                    {LANG_OPTIONS.find(l => l.code === appLang)?.flag} {LANG_OPTIONS.find(l => l.code === appLang)?.native}
                  </span>
                  <button type="button" onClick={() => setStep('language')}
                    className="uppercase tracking-widest text-xs" style={{ color: 'var(--accent)', fontSize: '9px' }}>
                    {ui.changeLang}
                  </button>
                </div>
              </div>

              {mode === 'register' && <FormField label={ui.fullName} value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Your display name" />}
              <FormField label={ui.email} type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="you@example.com" />
              <FormField label={ui.password} type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="••••••••" />

              {mode === 'register' && (
                <>
                  <div>
                    <label className="section-label block mb-3">{ui.accountType}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['user', 'expert'] as const).map(r => (
                        <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                          className="flex flex-col items-center gap-2 p-4 text-xs font-medium transition-colors"
                          style={form.role === r
                            ? { background: 'var(--ink)', color: 'var(--paper)', border: '1px solid var(--ink)' }
                            : { background: 'transparent', color: 'var(--ink-muted)', border: '1px solid var(--border-medium)' }}>
                          <span className="text-2xl">{r === 'user' ? '🙋' : '🧠'}</span>
                          <span className="uppercase tracking-wider" style={{ fontSize: '9px' }}>{r}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.role === 'expert' && (
                    <>
                      <FormField label={ui.domain} value={form.domainSlug} onChange={v => setForm(f => ({ ...f, domainSlug: v }))} placeholder="medicine, law, computer-science…" />
                      <FormField label={ui.bio} value={form.bio} onChange={v => setForm(f => ({ ...f, bio: v }))} placeholder="Brief professional description" />

                      <div>
                        <label className="section-label block mb-1">{ui.examLang}</label>
                        <p className="text-xs mb-3" style={{ color: 'var(--ink-muted)' }}>{ui.examLangSub}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {LANG_OPTIONS.map(l => (
                            <button key={l.code} type="button" onClick={() => setForm(f => ({ ...f, examLanguage: l.code }))}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors"
                              style={form.examLanguage === l.code
                                ? { background: 'var(--ink)', color: 'var(--paper)', border: '1px solid var(--ink)' }
                                : { background: 'transparent', color: 'var(--ink-muted)', border: '1px solid var(--border-medium)' }}>
                              <span>{l.flag}</span><span>{l.native}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="section-label block mb-1">{ui.textLangs}</label>
                        <p className="text-xs mb-3" style={{ color: 'var(--ink-muted)' }}>{ui.textLangsSub}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {LANG_OPTIONS.map(l => {
                            const selected = form.textLanguages.includes(l.code);
                            return (
                              <button key={l.code} type="button" onClick={() => toggleTextLang(l.code)}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors"
                                style={selected
                                  ? { background: 'var(--accent)', color: 'var(--paper)', border: '1px solid var(--accent)' }
                                  : { background: 'transparent', color: 'var(--ink-muted)', border: '1px solid var(--border-medium)' }}>
                                <span>{l.flag}</span><span>{l.native}</span>
                                {selected && <span className="ms-auto">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs mt-2" style={{ color: 'var(--ink-muted)' }}>
                          {form.textLanguages.map(c => TEXT_LANG_LABELS[c]).join(' · ')}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              {error && (
                <div className="py-3 px-4 text-sm"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-editorial w-full py-3">
                {loading ? (mode === 'login' ? ui.signing : ui.wait) : (mode === 'login' ? ui.signIn : ui.submit)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="section-label block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required
        className="input-editorial" />
    </div>
  );
}
