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
import SearchPage from '@/components/SearchPage';
import Leaderboard from '@/components/Leaderboard';
import AdminPanel from '@/components/AdminPanel';
import { useLang } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTheme } from '@/lib/theme/ThemeContext';

type Tab = 'dashboard' | 'experts' | 'consultations' | 'ask' | 'rewards' | 'expert-dashboard' | 'notifications' | 'my-questions' | 'search' | 'leaderboard' | 'admin';

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, dir } = useLang();
  const { user, unreadNotifications, logout, loading } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  const isExpert = user?.role === 'expert';
  const isAdmin  = user?.role === 'admin';

  const NAV_LABELS: Record<Tab, string> = {
    dashboard:         t('nav_dashboard'),
    search:            'Search',
    experts:           t('nav_experts'),
    consultations:     t('nav_competitions'),
    leaderboard:       'Leaderboard',
    ask:               t('nav_ask'),
    'my-questions':    'My Questions',
    rewards:           t('nav_rewards'),
    notifications:     'Notifications',
    'expert-dashboard':'Expert Hub',
    admin:             'Admin',
  };

  const PRIMARY_NAV: Tab[] = ['dashboard', 'experts', 'consultations', 'leaderboard'];
  const AUTH_NAV:    Tab[] = ['ask', 'my-questions', 'rewards', 'notifications'];
  const EXPERT_NAV:  Tab[] = ['expert-dashboard'];
  const ADMIN_NAV:   Tab[] = ['admin'];

  const visibleNav: Tab[] = [
    ...PRIMARY_NAV,
    ...(user ? AUTH_NAV : []),
    ...(isExpert ? EXPERT_NAV : []),
    ...(isAdmin  ? ADMIN_NAV  : []),
  ];

  function navigate(id: Tab) { setTab(id); setMobileMenuOpen(false); }

  return (
    <div className="min-h-screen flex flex-col animate-fade-in" dir={dir}
      style={{ background: 'var(--paper)', color: 'var(--ink)' }}>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-40" style={{ background: 'var(--paper)', borderBottom: '1px solid var(--border-subtle)' }}>
        {/* Volume strip */}
        <div className="px-8 pt-2 pb-0 flex items-center justify-between">
          <span className="section-label opacity-50">
            Knowledge Market · Vol. I
          </span>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle theme={theme} toggle={toggleTheme} />
          </div>
        </div>

        {/* Logo + nav row */}
        <div className="px-8 py-3 flex items-center gap-10">
          {/* Logo */}
          <button onClick={() => navigate('dashboard')} className="flex-shrink-0 flex items-baseline gap-2">
            <span className="font-display text-xl font-normal italic" style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}>
              Nexus
            </span>
            <span className="section-label" style={{ color: 'var(--accent)' }}>Market</span>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-7 flex-1">
            {visibleNav.map(id => (
              <button key={id} onClick={() => navigate(id)}
                className={`nav-link relative ${tab === id ? 'nav-link-active' : 'nav-link-inactive'}`}>
                {NAV_LABELS[id]}
                {id === 'notifications' && unreadNotifications > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3 ms-auto">
            {!loading && (
              user ? (
                <div className="flex items-center gap-4">
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {user.name}
                    <span className="ms-1 opacity-50">· {user.role}</span>
                  </span>
                  <button onClick={logout} className="btn-editorial-outline py-1.5 px-3">
                    Sign out
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="btn-editorial py-2 px-5">
                  Sign In
                </button>
              )
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden ms-auto p-1" style={{ color: 'var(--ink-muted)' }}
            onClick={() => setMobileMenuOpen(o => !o)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t animate-slide-up" style={{ borderColor: 'var(--border-subtle)', background: 'var(--paper)' }}>
            <div className="px-6 py-4 flex flex-col gap-4">
              {visibleNav.map(id => (
                <button key={id} onClick={() => navigate(id)}
                  className={`nav-link text-left ${tab === id ? 'nav-link-active' : 'nav-link-inactive'}`}>
                  {NAV_LABELS[id]}
                  {id === 'notifications' && unreadNotifications > 0 && (
                    <span className="ms-2 text-red-500">({unreadNotifications})</span>
                  )}
                </button>
              ))}
              <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {!loading && (user ? (
                  <button onClick={logout} className="btn-editorial-outline w-full py-2">Sign out</button>
                ) : (
                  <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
                    className="btn-editorial w-full py-2">Sign In</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 animate-fade-in">
        {tab === 'dashboard'         && <Dashboard />}
        {tab === 'experts'           && <ExpertsDirectory />}
        {tab === 'consultations'     && <ConsultationsBoard />}
        {tab === 'ask'               && <AskQuestion />}
        {tab === 'rewards'           && <RewardPanel />}
        {tab === 'expert-dashboard'  && <ExpertDashboard />}
        {tab === 'my-questions'      && <MyQuestions />}
        {tab === 'notifications'     && <NotificationsPanel />}
        {tab === 'search'            && <SearchPage />}
        {tab === 'leaderboard'       && <Leaderboard />}
        {tab === 'admin'             && <AdminPanel />}
      </main>

      {/* ── Footer ── */}
      <footer className="px-8 py-6 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <span className="section-label">© 2026 Nexus Knowledge Market</span>
        <span className="section-label" style={{ color: 'var(--accent)' }}>AI-Powered Expert Platform</span>
      </footer>
    </div>
  );
}

function ThemeToggle({ theme, toggle }: { theme: string; toggle: () => void }) {
  return (
    <button onClick={toggle} className="section-label transition-opacity hover:opacity-60"
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
      {theme === 'dark' ? '○ Light' : '● Dark'}
    </button>
  );
}
