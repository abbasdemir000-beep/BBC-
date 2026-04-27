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
import type { TKey } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTheme } from '@/lib/theme/ThemeContext';

type Tab = 'dashboard' | 'experts' | 'consultations' | 'ask' | 'rewards' | 'expert-dashboard' | 'notifications' | 'my-questions' | 'search' | 'leaderboard' | 'admin';

const NAV_ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm8-4a1 1 0 00-1 1v3.586L7.707 9.293a1 1 0 00-1.414 1.414l2 2A1 1 0 0010 13h.01a1 1 0 00.697-.29l3-3a1 1 0 00-1.414-1.414L11 9.586V7a1 1 0 00-1-1z"/>
    </svg>
  ),
  ask: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
    </svg>
  ),
  consultations: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM6.293 6.707a1 1 0 010-1.414l.7-.7a1 1 0 111.414 1.414l-.7.7a1 1 0 01-1.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zM11 17a1 1 0 10-2 0v1a1 1 0 102 0v-1zM15.657 5.757a1 1 0 00-1.414-1.414l-.7.7a1 1 0 001.414 1.414l.7-.7zM6.343 15.657a1 1 0 00-1.414-1.414l-.7.7a1 1 0 001.414 1.414l.7-.7zM16 11a1 1 0 100-2h-1a1 1 0 100 2h1zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
    </svg>
  ),
  experts: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
    </svg>
  ),
  rewards: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd"/>
    </svg>
  ),
  'expert-dashboard': (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
    </svg>
  ),
  'my-questions': (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
    </svg>
  ),
  notifications: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
    </svg>
  ),
  search: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
    </svg>
  ),
  leaderboard: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
    </svg>
  ),
  admin: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
    </svg>
  ),
};

const NAV_GROUPS: Array<{ labelKey: TKey; items: string[] }> = [
  { labelKey: 'nav_group_explore',  items: ['dashboard', 'search', 'experts', 'consultations', 'leaderboard'] },
  { labelKey: 'nav_group_my_space', items: ['ask', 'my-questions', 'rewards', 'notifications'] },
  { labelKey: 'nav_group_expert',   items: ['expert-dashboard'] },
  { labelKey: 'nav_group_system',   items: ['admin'] },
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

  const NAV: { id: Tab; expertOnly?: boolean; authOnly?: boolean; adminOnly?: boolean }[] = [
    { id: 'dashboard'        },
    { id: 'search'           },
    { id: 'experts'          },
    { id: 'consultations'    },
    { id: 'leaderboard'      },
    { id: 'ask',       authOnly: true },
    { id: 'my-questions', authOnly: true },
    { id: 'rewards',   authOnly: true },
    { id: 'notifications', authOnly: true },
    { id: 'expert-dashboard', expertOnly: true },
    { id: 'admin', adminOnly: true },
  ];

  const NAV_LABELS: Record<string, string> = {
    dashboard:         t('nav_dashboard'),
    search:            t('nav_search'),
    experts:           t('nav_experts'),
    consultations:     t('nav_competitions'),
    leaderboard:       t('nav_leaderboard'),
    ask:               t('nav_ask'),
    'my-questions':    t('nav_my_questions'),
    rewards:           t('nav_rewards'),
    notifications:     t('nav_notifications'),
    'expert-dashboard':t('nav_expert_hub'),
    admin:             t('nav_admin'),
  };

  const visible = NAV.filter(n =>
    (!n.expertOnly || isExpert) &&
    (!n.authOnly   || !!user) &&
    (!n.adminOnly  || isAdmin || user?.role === 'admin')
  ).map(n => n.id);

  function navigate(id: Tab) { setTab(id); setSidebarOpen(false); }

  const sidebarBase = 'fixed md:static inset-y-0 start-0 z-40 w-64 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0';
  const sidebarSlide = sidebarOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full');

  return (
    <div className="flex min-h-screen" dir={dir} style={{ background: 'var(--bg)' }}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center px-4 py-3"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl me-3 transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <LogoMark />
        <div className="ms-auto flex items-center gap-2">
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          {unreadNotifications > 0 && (
            <button onClick={() => navigate('notifications')}
              className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
              style={{ background: 'linear-gradient(135deg,#dc2626,#f97316)' }}>
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </button>
          )}
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`${sidebarBase} ${sidebarSlide}`}
        style={{ background: 'var(--surface)', borderInlineEnd: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <LogoFull />
          <ThemeToggle theme={theme} toggle={toggleTheme} />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_GROUPS.map(group => {
            const groupItems = group.items.filter(id => visible.includes(id as Tab));
            if (groupItems.length === 0) return null;
            return (
              <div key={group.labelKey}>
                <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}>
                  {t(group.labelKey)}
                </div>
                <div className="space-y-0.5">
                  {groupItems.map(id => (
                    <NavItem
                      key={id}
                      id={id as Tab}
                      label={NAV_LABELS[id]}
                      icon={NAV_ICONS[id]}
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
        <div className="px-3 py-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
          <LanguageSwitcher />
          {!loading && (
            user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: 'var(--surface-2)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#c2714f,#d4a853)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
                    <div className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{user.role}</div>
                  </div>
                  {unreadNotifications > 0 && (
                    <button onClick={() => navigate('notifications')}
                      className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#dc2626,#f97316)' }}>
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </button>
                  )}
                </div>
                <button onClick={logout}
                  className="w-full text-xs py-2 px-3 rounded-xl text-start transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color='#f87171'; e.currentTarget.style.background='rgba(248,113,113,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background=''; }}>
                  {t('sign_out')}
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-primary w-full py-2.5">
                {t('sign_in')}
              </button>
            )
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0 min-w-0 animate-fade-in">
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
      </main>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function LogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
        style={{ background: 'linear-gradient(135deg,#c2714f,#d4a853)' }}>K</div>
      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>KnowledgeMarket</span>
    </div>
  );
}

function LogoFull() {
  const { t } = useLang();
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0 animate-glow"
        style={{ background: 'linear-gradient(135deg,#c2714f,#d4a853)', boxShadow: '0 0 20px rgba(194,113,79,0.4)' }}>K</div>
      <div>
        <div className="font-bold text-sm leading-tight gradient-text">KnowledgeMarket</div>
        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('logo_subtitle')}</div>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, toggle }: { theme: string; toggle: () => void }) {
  const { t } = useLang();
  return (
    <button onClick={toggle}
      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
      style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      title={theme === 'dark' ? t('theme_to_light') : t('theme_to_dark')}>
      {theme === 'dark' ? (
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
        </svg>
      )}
    </button>
  );
}

function NavItem({ id, label, icon, active, badge, onClick }: {
  id: string; label: string; icon: React.ReactNode;
  active: boolean; badge?: number; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-start"
      style={active ? {
        background: 'rgba(194,113,79,0.12)',
        color: 'var(--accent)',
        border: '1px solid rgba(194,113,79,0.2)',
        boxShadow: '0 0 16px rgba(194,113,79,0.08)',
      } : {
        color: 'var(--text-secondary)',
        border: '1px solid transparent',
      }}>
      <span className="flex-shrink-0 opacity-80">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#dc2626,#f97316)' }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}
