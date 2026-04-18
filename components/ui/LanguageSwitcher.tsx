'use client';
import { useLang } from '@/lib/i18n/LanguageContext';
import { LANGUAGES, type Lang } from '@/lib/i18n/translations';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
      {(Object.entries(LANGUAGES) as [Lang, typeof LANGUAGES[Lang]][]).map(([code, info]) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            lang === code
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          style={{ fontFamily: info.font, direction: info.dir }}
        >
          <span>{info.flag}</span>
          <span>{info.label}</span>
        </button>
      ))}
    </div>
  );
}
