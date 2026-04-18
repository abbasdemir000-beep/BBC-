'use client';
import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import ExpertsDirectory from '@/components/ExpertsDirectory';
import ConsultationsBoard from '@/components/ConsultationsBoard';
import AskQuestion from '@/components/AskQuestion';
import RewardPanel from '@/components/RewardPanel';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLang } from '@/lib/i18n/LanguageContext';

type Tab = 'dashboard' | 'experts' | 'consultations' | 'ask' | 'rewards';

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const { t, dir } = useLang();

  const NAV: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard',     label: t('nav_dashboard'),    icon: '📊' },
    { id: 'ask',           label: t('nav_ask'),           icon: '❓' },
    { id: 'consultations', label: t('nav_competitions'),  icon: '⚡' },
    { id: 'experts',       label: t('nav_experts'),       icon: '🧠' },
    { id: 'rewards',       label: t('nav_rewards'),       icon: '🏆' },
  ];

  return (
    <div className="flex min-h-screen" dir={dir}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-e border-slate-100 flex flex-col shadow-sm flex-shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">K</div>
            <div>
              <div className="font-bold text-slate-900 text-sm leading-tight">KnowledgeMarket</div>
              <div className="text-xs text-slate-500">AI Expert Marketplace</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-start ${
                tab === item.id
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <LanguageSwitcher />
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">D</div>
            <div>
              <div className="text-xs font-semibold text-slate-700">{t('demo_user')}</div>
              <div className="text-xs text-slate-400">150 {t('pts')}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {tab === 'dashboard'     && <Dashboard />}
        {tab === 'experts'       && <ExpertsDirectory />}
        {tab === 'consultations' && <ConsultationsBoard />}
        {tab === 'ask'           && <AskQuestion />}
        {tab === 'rewards'       && <RewardPanel />}
      </main>
    </div>
  );
}
