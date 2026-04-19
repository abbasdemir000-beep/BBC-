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
  { code: 'tr', label: 'Turkish',  native: 'Türkçe',  flag: '🇹🇷',  dir: 'ltr' },
];

const TEXT_LANG_LABELS: Record<string, string> = {
  en: 'Accept English questions',
  ar: 'Accept Arabic questions',
  ku: 'Accept Kurdish questions',
  tr: 'Accept Turkish questions',
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
    welcome: 'Welcome back!', joinUs: 'Join the knowledge marketplace',
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
    welcome: 'مرحباً بعودتك!', joinUs: 'انضم إلى سوق المعرفة',
    fullName: 'الاسم الكامل', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    accountType: 'نوع الحساب', userDesc: 'اطرح أسئلة واحصل على إجابات من الخبراء',
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
    welcome: 'بەخێر بێیتەوە!', joinUs: 'بەشداری بازاڕی زانستدا بکە',
    fullName: 'ناوی تەواو', email: 'ئیمەیڵ', password: 'وشەی نهێنی',
    accountType: 'جۆری هەژمار', userDesc: 'پرسیار بکە و وەڵامی پسپۆڕەکان وەربگرە',
    expertDesc: 'وەڵام بدەرەوە و خەڵات بەدەست بهێنە',
    domain: 'بواری پسپۆڕایەتی', bio: 'ژیاننامەی پیشەیی',
    examLang: 'زمانی تاقیکردنەوە', examLangSub: 'زمانی تاقیکردنەوەی پێشکەوتوو',
    textLangs: 'زمانی پرسیارەکان', textLangsSub: 'کام زمانی پرسیار قبوڵ دەکەیت؟',
    submit: 'هەژمار دروستبکە', signing: 'چوونە ژوورەوە…', wait: 'چاوەڕێبکە…',
    appLang: 'زمانی ئەپ', changeLang: 'گۆڕین',
  },
  tr: {
    chooseApp: 'Dilinizi Seçin', chooseAppSub: 'Devam etmek için tercih ettiğiniz dili seçin',
    continue: 'Devam Et', signIn: 'Giriş Yap', register: 'Kayıt Ol',
    welcome: 'Tekrar hoş geldiniz!', joinUs: 'Bilgi pazarına katılın',
    fullName: 'Tam Ad', email: 'E-posta Adresi', password: 'Şifre',
    accountType: 'Hesap Türü', userDesc: 'Soru sor ve uzman cevapları al',
    expertDesc: 'Soruları cevapla ve ödüller kazan',
    domain: 'Uzmanlık Alanı', bio: 'Profesyonel Biyografi',
    examLang: 'Sınav Dili', examLangSub: 'Yeterlilik sınavınız için kullanılan dil',
    textLangs: 'Soru Dilleri', textLangsSub: 'Hangi dildeki soruları kabul edeceksiniz?',
    submit: 'Hesap Oluştur', signing: 'Giriş yapılıyor…', wait: 'Lütfen bekleyin…',
    appLang: 'Uygulama Dili', changeLang: 'Değiştir',
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

  function selectAppLang(l: Lang) {
    setAppLang(l);
    setLang(l); // preview immediately
  }

  function toggleTextLang(l: Lang) {
    setForm(f => {
      const has = f.textLanguages.includes(l);
      const next = has
        ? f.textLanguages.filter(x => x !== l)
        : [...f.textLanguages, l];
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
    <div className="modal-backdrop animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="modal-panel w-full max-w-md mx-4 animate-scale-in">

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="text-white font-bold text-lg">
              {step === 'language' ? ui.chooseApp : (mode === 'login' ? ui.signIn : ui.register)}
            </h2>
            <p className="text-white/70 text-sm mt-0.5">
              {step === 'language' ? ui.chooseAppSub : (mode === 'login' ? ui.welcome : ui.joinUs)}
            </p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none transition-colors">×</button>
        </div>

        {/* Mode tabs (only when on form step) */}
        {step === 'form' && (
          <div className="flex gap-1 p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={mode === m
                  ? { background: 'var(--accent)', color: '#fff', boxShadow: '0 4px 12px var(--accent-glow)' }
                  : { color: 'var(--text-muted)', background: 'var(--surface-2)' }}>
                {m === 'login' ? ui.signIn : ui.register}
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          {/* ── Step 1: Language picker ── */}
          {step === 'language' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {LANG_OPTIONS.map(l => (
                  <button key={l.code} onClick={() => selectAppLang(l.code)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 font-semibold"
                    style={appLang === l.code
                      ? { borderColor: 'var(--accent)', background: 'var(--accent-glow)', color: 'var(--accent)', boxShadow: '0 0 20px var(--accent-glow)' }
                      : { borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface-2)' }}>
                    <span className="text-3xl">{l.flag}</span>
                    <span className="text-xs text-center leading-tight">{l.native}</span>
                    {appLang === l.code && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]"
                        style={{ background: 'var(--accent)' }}>✓</div>
                    )}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('form')} className="btn-primary w-full py-3 text-sm">
                {ui.continue} →
              </button>
            </div>
          )}

          {/* ── Step 2: Form ── */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* App language badge + change link */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{ui.appLang}:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {LANG_OPTIONS.find(l => l.code === appLang)?.flag} {LANG_OPTIONS.find(l => l.code === appLang)?.native}
                  </span>
                  <button type="button" onClick={() => setStep('language')}
                    className="text-xs font-semibold transition-colors"
                    style={{ color: 'var(--accent)' }}>
                    {ui.changeLang}
                  </button>
                </div>
              </div>

              {mode === 'register' && <FormField label={ui.fullName} value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Your display name" />}
              <FormField label={ui.email} type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="you@example.com" />
              <FormField label={ui.password} type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="••••••••" />

              {mode === 'register' && (
                <>
                  {/* Role picker */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{ui.accountType}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['user', 'expert'] as const).map(r => (
                        <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200"
                          style={form.role === r
                            ? { borderColor: 'var(--accent)', background: 'var(--accent-glow)', color: 'var(--accent)' }
                            : { borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface-2)' }}>
                          <span className="text-2xl">{r === 'user' ? '🙋' : '🧠'}</span>
                          <span className="text-xs font-bold capitalize">{r === 'user' ? ui.userDesc.split('&')[0] : ui.expertDesc.split('&')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expert-only fields */}
                  {form.role === 'expert' && (
                    <>
                      <FormField label={ui.domain} value={form.domainSlug} onChange={v => setForm(f => ({ ...f, domainSlug: v }))} placeholder="medicine, law, computer-science…" />
                      <FormField label={ui.bio} value={form.bio} onChange={v => setForm(f => ({ ...f, bio: v }))} placeholder="Brief professional description" />

                      {/* Exam language */}
                      <div>
                        <label className="block text-xs font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>{ui.examLang}</label>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{ui.examLangSub}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {LANG_OPTIONS.map(l => (
                            <button key={l.code} type="button" onClick={() => setForm(f => ({ ...f, examLanguage: l.code }))}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200"
                              style={form.examLanguage === l.code
                                ? { borderColor: 'var(--accent)', background: 'var(--accent-glow)', color: 'var(--accent)' }
                                : { borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface-2)' }}>
                              <span>{l.flag}</span>
                              <span>{l.native}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text languages (multi-select) */}
                      <div>
                        <label className="block text-xs font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>{ui.textLangs}</label>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{ui.textLangsSub}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {LANG_OPTIONS.map(l => {
                            const selected = form.textLanguages.includes(l.code);
                            return (
                              <button key={l.code} type="button" onClick={() => toggleTextLang(l.code)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200"
                                style={selected
                                  ? { borderColor: '#34d399', background: 'rgba(52,211,153,0.1)', color: '#34d399' }
                                  : { borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface-2)' }}>
                                <span>{l.flag}</span>
                                <span>{l.native}</span>
                                {selected && <span className="ms-auto">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                          {form.textLanguages.map(c => TEXT_LANG_LABELS[c]).join(' · ')}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
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
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required
        className="input" />
    </div>
  );
}
