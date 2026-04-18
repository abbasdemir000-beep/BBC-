'use client';
import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import ExpertsDirectory from '@/components/ExpertsDirectory';
import ConsultationsBoard from '@/components/ConsultationsBoard';
import AskQuestion from '@/components/AskQuestion';
import RewardPanel from '@/components/RewardPanel';
import ExpertDashboard from '@/components/ExpertDashboard';
import NotificationsPanel from '@/components/NotificationsPanel';
import MyQuestions from '@/components/MyQuestions';
import AuthModal from '@/components/AuthModal';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLang } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';

type Tab = 'dashboard' | 'experts' | 'consultations' | 'ask' | 'rewards' | 'expert-dashboard' | 'notifications' | 'my-questions';

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showAuth, setShowAuth] = useState(false);
  const { t, dir } = useLang();
  const { user, expert, unreadNotifications, logout, loading } = useAuth();

  const isExpert = user?.role === 'expert';

  const NAV: { id: Tab; label: string; icon: string; expertOnly?: boolean; authOnly?: boolean }[] = [
    { id: 'dashboard',        label: t('nav_dashboard'),   icon: '📊' },
    { id: 'ask',              label: t('nav_ask'),          icon: '❓' },
    { id: 'consultations',   label: t('nav_competitions'), icon: '⚡' },
    { id: 'experts',         label: t('nav_experts'),      icon: '🧠' },
    { id: 'rewards',         label: t('nav_rewards'),      icon: '🏆' },
    { id: 'expert-dashboard', label: 'My Targeted',        icon: '🎯', expertOnly: true },
    { id: 'my-questions',     label: 'My Questions',       icon: '📋', authOnly: true },
    { id: 'notifications',    label: 'Notifications',      icon: '🔔', authOnly: true },
  ];

  const visibleNav = NAV.filter(n =>
    (!n.expertOnly || isExpert) && (!n.authOnly || !!user)
  );

  return (
    <div className="flex min-h-screen" dir={dir}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

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
          {visibleNav.map(item => (
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

          {!loading && (
            user ? (
              <div className="space-y-2">
                {/* Notification bell */}
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-700 truncate">{user.name}</div>
                    <div className="text-xs text-slate-400 capitalize">{user.role}</div>
                  </div>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={() => setTab('notifications')}
                      className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0 hover:bg-red-600 transition-colors"
                    >
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </button>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="w-full text-xs text-slate-500 hover:text-red-600 py-1.5 px-3 rounded-lg hover:bg-red-50 transition-all text-start"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="w-full py-2.5 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-brand-600 hover:to-purple-700 transition-all shadow-sm"
              >
                Sign In / Register
              </button>
            )
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {tab === 'dashboard'        && <Dashboard />}
        {tab === 'experts'          && <ExpertsDirectory />}
        {tab === 'consultations'    && <ConsultationsBoard />}
        {tab === 'ask'              && <AskQuestion />}
        {tab === 'rewards'          && <RewardPanel />}
        {tab === 'expert-dashboard' && <ExpertDashboard />}
        {tab === 'my-questions'     && <MyQuestions />}
        {tab === 'notifications'    && <NotificationsPanel />}
      </main>
    </div>
  );
}
