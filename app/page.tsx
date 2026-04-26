'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

/* nav definition: label maps to Cmd terminology */
const NAV_PRIMARY: { id: Tab; label: string; authOnly?: boolean; expertOnly?: boolean; adminOnly?: boolean }[] = [
  { id: 'dashboard',     label: 'Marketplace'  },
  { id: 'experts',       label: 'Architects'   },
  { id: 'consultations', label: 'Bounties'     },
  { id: 'leaderboard',   label: 'Rankings'     },
  { id: 'ask',           label: 'Submit',       authOnly: true },
  { id: 'rewards',       label: 'Journal',      authOnly: true },
  { id: 'expert-dashboard', label: 'Expert Hub', expertOnly: true },
  { id: 'admin',         label: 'Admin',        adminOnly: true },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showAuth, setShowAuth] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, dir } = useLang();
  const { user, unreadNotifications, logout, loading } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  const isExpert = user?.role === 'expert';
  const isAdmin  = user?.role === 'admin';

  const visibleNav = NAV_PRIMARY.filter(n =>
    (!n.expertOnly || isExpert) &&
    (!n.authOnly   || !!user)   &&
    (!n.adminOnly  || isAdmin)
  );

  function navigate(id: Tab) { setTab(id); setMobileOpen(false); }

  const ISSUE_DATE = 'Vol. 02 — 2026';

  return (
    <div className="flex flex-col h-screen overflow-hidden" dir={dir}
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(26,26,26,0.5)' }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-y-0 start-0 z-50 w-64 flex flex-col md:hidden"
          style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-xl font-black tracking-tighter uppercase" style={{ fontFamily: 'Inter' }}>
              KnowledgeMarket
            </span>
            <button onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
            {visibleNav.map(n => (
              <button key={n.id} onClick={() => navigate(n.id)}
                className={`w-full text-start py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-all ${
                  tab === n.id ? 'border-b border-current' : 'opacity-40 hover:opacity-100'
                }`}
                style={{ color: 'var(--text-primary)', background: 'none', border: 'none', borderBottom: tab === n.id ? `1px solid var(--text-primary)` : 'none' }}>
                {n.label}
              </button>
            ))}
            {/* extra tabs */}
            {user && (
              <>
                <button onClick={() => navigate('my-questions')}
                  className={`w-full text-start py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-all ${tab === 'my-questions' ? '' : 'opacity-40 hover:opacity-100'}`}
                  style={{ color: 'var(--text-primary)', background: 'none', border: 'none' }}>
                  My Questions
                </button>
                <button onClick={() => navigate('notifications')}
                  className={`w-full text-start py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-all ${tab === 'notifications' ? '' : 'opacity-40 hover:opacity-100'}`}
                  style={{ color: 'var(--text-primary)', background: 'none', border: 'none' }}>
                  Notifications {unreadNotifications > 0 && `(${unreadNotifications})`}
                </button>
              </>
            )}
          </nav>
          <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <LanguageSwitcher />
          </div>
        </div>
      )}

      {/* ── Editorial Header ── */}
      <header className="shrink-0 px-8 md:px-12 pt-8 pb-0">
        <div className="nav-header max-w-[1280px] mx-auto">
          {/* Logo */}
          <button onClick={() => navigate('dashboard')}
            className="text-2xl font-black tracking-tighter uppercase leading-none"
            style={{ fontFamily: 'Inter', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            KnowledgeMarket
          </button>

          {/* Primary Nav — desktop */}
          <nav className="hidden md:flex items-baseline gap-8">
            {visibleNav.map(n => (
              <button key={n.id} onClick={() => navigate(n.id)}
                className={`nav-link ${tab === n.id ? 'nav-link-active' : 'nav-link-inactive'}`}>
                {n.label}
              </button>
            ))}
            {user && (
              <>
                <button onClick={() => navigate('my-questions')}
                  className={`nav-link ${tab === 'my-questions' ? 'nav-link-active' : 'nav-link-inactive'}`}>
                  My Questions
                </button>
                <button onClick={() => navigate('notifications')}
                  className={`nav-link ${tab === 'notifications' ? 'nav-link-active' : 'nav-link-inactive'} relative`}>
                  Notifications
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[8px] font-black"
                      style={{ background: '#a83230' }}>
                      {unreadNotifications > 9 ? '9' : unreadNotifications}
                    </span>
                  )}
                </button>
                {tab === 'search' && (
                  <button onClick={() => navigate('search')}
                    className={`nav-link ${tab === 'search' ? 'nav-link-active' : 'nav-link-inactive'}`}>
                    Search
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Issue date — desktop only */}
            <span className="hidden lg:block text-[11px] font-bold uppercase tracking-wider opacity-35 font-sans">
              {ISSUE_DATE}
            </span>

            {/* Search icon */}
            <button onClick={() => navigate('search')}
              className="nav-link nav-link-inactive"
              title="Search">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
            </button>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="nav-link nav-link-inactive" title="Toggle theme">
              {theme === 'dark' ? (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              )}
            </button>

            {/* Language */}
            <div className="hidden md:block"><LanguageSwitcher /></div>

            {/* Auth */}
            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 hidden md:block"
                    style={{ fontFamily: 'Inter' }}>
                    {user.name}
                  </div>
                  <button onClick={logout}
                    className="nav-link nav-link-inactive text-[9px]">
                    Sign Out
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="btn-editorial" style={{ padding: '8px 20px' }}>
                  Sign In
                </button>
              )
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden nav-link nav-link-inactive" onClick={() => setMobileOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-12 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.2, 0.9, 0.4, 1.0] }}
            >
              {tab === 'dashboard'        && <Dashboard />}
              {tab === 'experts'          && <ExpertsDirectory />}
              {tab === 'consultations'    && <ConsultationsBoard />}
              {tab === 'ask'              && <AskQuestion />}
              {tab === 'rewards'          && <RewardPanel />}
              {tab === 'expert-dashboard' && <ExpertDashboard />}
              {tab === 'my-questions'     && <MyQuestions />}
              {tab === 'notifications'    && <NotificationsPanel />}
              {tab === 'search'           && <SearchPage />}
              {tab === 'leaderboard'      && <Leaderboard />}
              {tab === 'admin'            && <AdminPanel />}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="max-w-[1280px] mx-auto px-8 md:px-12 mt-16 flex justify-between items-center border-t pb-10 pt-8"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Inter' }}>
          <div>Est. 2024 / KnowledgeMarket v2.0</div>
          <div className="hidden sm:block">AI Expert Platform</div>
          <div>© All Intellectual Rights Reserved</div>
        </footer>
      </main>
    </div>
  );
}
