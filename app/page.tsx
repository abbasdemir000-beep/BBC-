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

const NAV_GROUPS = [
  { label: 'Explore', items: ['dashboard', 'search', 'experts', 'consultations', 'leaderboard'] },
  { label: 'My Space', items: ['ask', 'my-questions', 'rewards', 'notifications'] },
  { label: 'Expert', items: ['expert-dashboard'] },
  { label: 'System', items: ['admin'] },
];

const NAV_LABELS: Record<string, string> = {
  dashboard: 'Marketplace',
  search: 'Search',
  experts: 'Architects',
  consultations: 'Bounties',
  leaderboard: 'Rankings',
  ask: 'Submit Inquiry',
  'my-questions': 'My Inquiries',
  rewards: 'Journal',
  notifications: 'Notifications',
  'expert-dashboard': 'Expert Hub',
  admin: 'Admin',
};

const NAV_DEF: { id: Tab; expertOnly?: boolean; authOnly?: boolean; adminOnly?: boolean }[] = [
  { id: 'dashboard'        },
  { id: 'search'           },
  { id: 'experts'          },
  { id: 'consultations'    },
  { id: 'leaderboard'      },
  { id: 'ask',              authOnly: true },
  { id: 'my-questions',    authOnly: true },
  { id: 'rewards',         authOnly: true },
  { id: 'notifications',   authOnly: true },
  { id: 'expert-dashboard', expertOnly: true },
  { id: 'admin',           adminOnly: true },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showAuth, setShowAuth] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, dir } = useLang();
  const { user, unreadNotifications, logout, loading } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  const isExpert = user?.role === 'expert';
  const isAdmin  = user?.role === 'admin';

  const visible = NAV_DEF.filter(n =>
    (!n.expertOnly || isExpert) &&
    (!n.authOnly   || !!user)   &&
    (!n.adminOnly  || isAdmin)
  ).map(n => n.id);

  function navigate(id: Tab) { setTab(id); setSidebarOpen(false); }

  const sidebarBase = 'fixed md:static inset-y-0 start-0 z-40 w-64 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0';
  const sidebarSlide = sidebarOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full');

  return (
    <div className="flex min-h-screen" dir={dir} style={{ background: 'var(--bg)' }}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(26,26,26,0.5)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center px-5 py-4"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => setSidebarOpen(true)} className="me-4" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
        <span className="font-black text-base tracking-tighter uppercase" style={{ fontFamily: 'Inter', color: 'var(--text-primary)' }}>
          KnowledgeMarket
        </span>
        <div className="ms-auto flex items-center gap-3">
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          {unreadNotifications > 0 && (
            <button onClick={() => navigate('notifications')}
              className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-black"
              style={{ background: '#a83230' }}>
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </button>
          )}
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`${sidebarBase} ${sidebarSlide}`}
        style={{ background: 'var(--surface)', borderInlineEnd: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="px-6 py-6 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => navigate('dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'start' }}>
            <div className="font-black text-lg tracking-tighter uppercase leading-none" style={{ fontFamily: 'Inter', color: 'var(--text-primary)' }}>
              Knowledge
            </div>
            <div className="font-light italic text-sm serif leading-tight" style={{ color: 'var(--accent)' }}>
              Market
            </div>
          </button>
          <ThemeToggle theme={theme} toggle={toggleTheme} />
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {NAV_GROUPS.map(group => {
            const groupItems = group.items.filter(id => visible.includes(id as Tab));
            if (groupItems.length === 0) return null;
            return (
              <div key={group.label}>
                <div className="px-2 mb-2 text-[9px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {groupItems.map(id => (
                    <NavItem
                      key={id}
                      id={id as Tab}
                      label={NAV_LABELS[id]}
                      active={tab === id}
                      badge={id === 'notifications' && unreadNotifications > 0 ? unreadNotifications : undefined}
                      onClick={() => navigate(id as Tab)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-5 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
          <LanguageSwitcher />

          {/* Issue line */}
          <div className="px-2 text-[9px] font-bold uppercase tracking-[0.25em]"
            style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>
            Vol. 02 — 2026
          </div>

          {!loading && (
            user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-2 py-2"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="w-8 h-8 flex items-center justify-center text-xs font-black flex-shrink-0 serif italic"
                    style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Inter' }}>{user.name}</div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{user.role}</div>
                  </div>
                  {unreadNotifications > 0 && (
                    <button onClick={() => navigate('notifications')}
                      className="w-5 h-5 rounded-full text-white text-[9px] flex items-center justify-center font-black flex-shrink-0"
                      style={{ background: '#a83230' }}>
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </button>
                  )}
                </div>
                <button onClick={logout}
                  className="w-full text-[10px] py-1.5 px-2 text-start font-bold uppercase tracking-widest transition-all"
                  style={{ color: 'var(--text-muted)', fontFamily: 'Inter', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#a83230'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-editorial w-full" style={{ padding: '10px 16px', fontSize: 10 }}>
                Sign In / Register
              </button>
            )
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.2, 0.9, 0.4, 1.0] }}
            className="h-full"
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
      </main>
    </div>
  );
}

/* ── Sub-components ── */

function ThemeToggle({ theme, toggle }: { theme: string; toggle: () => void }) {
  return (
    <button onClick={toggle}
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
      {theme === 'dark' ? (
        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
        </svg>
      )}
    </button>
  );
}

function NavItem({ id, label, active, badge, onClick }: {
  id: string; label: string; active: boolean; badge?: number; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-2 py-2.5 text-start transition-all"
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: active ? '1px solid var(--text-primary)' : '1px solid transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
        opacity: active ? 1 : 0.6,
        fontFamily: 'Inter', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = '1'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = '0.6'; }}>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-black flex-shrink-0"
          style={{ background: '#a83230' }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}
