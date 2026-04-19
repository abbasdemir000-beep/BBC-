'use client';
import { useLang } from '@/lib/i18n/LanguageContext';
import { LANGUAGES, type Lang } from '@/lib/i18n/translations';

function KurdistanFlag() {
  const rays = Array.from({ length: 21 }, (_, i) => {
    const rad = (i * (360 / 21) * Math.PI) / 180;
    return {
      x1: 15 + 2.6 * Math.cos(rad),
      y1: 10 + 2.6 * Math.sin(rad),
      x2: 15 + 4.2 * Math.cos(rad),
      y2: 10 + 4.2 * Math.sin(rad),
    };
  });
  return (
    <svg width="22" height="15" viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="6.67" fill="#EF2B2D" />
      <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
      <rect y="13.33" width="30" height="6.67" fill="#007A3D" />
      <circle cx="15" cy="10" r="2.2" fill="#F7D117" />
      {rays.map((r, i) => (
        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#F7D117" strokeWidth="0.7" />
      ))}
    </svg>
  );
}

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
          {code === 'ku' ? <KurdistanFlag /> : <span>{info.flag}</span>}
          <span>{info.label}</span>
        </button>
      ))}
    </div>
  );
}
