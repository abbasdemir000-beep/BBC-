'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { type Lang, type TKey, LANGUAGES, t as translate } from './translations';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  dir: 'ltr' | 'rtl';
}

const Ctx = createContext<LangCtx>({
  lang: 'en', setLang: () => {}, t: (k) => k, dir: 'ltr',
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('km_lang') as Lang | null;
    if (saved && ['en', 'ar', 'ku'].includes(saved)) setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem('km_lang', l);
    document.documentElement.setAttribute('dir', LANGUAGES[l].dir);
    document.documentElement.setAttribute('lang', l);
  }

  useEffect(() => {
    document.documentElement.setAttribute('dir', LANGUAGES[lang].dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const value: LangCtx = {
    lang,
    setLang,
    t: (key: TKey) => translate(key, lang),
    dir: LANGUAGES[lang].dir,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
