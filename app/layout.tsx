import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: { default: 'KnowledgeMarket — AI-Powered Expert Marketplace', template: '%s | KnowledgeMarket' },
  description: 'Ask questions, compete with experts, earn rewards. Multilingual AI-powered platform supporting English, Arabic, Kurdish, and Turkish.',
  keywords: ['expert marketplace', 'AI questions', 'knowledge platform', 'expert answers', 'earn rewards'],
  authors: [{ name: 'KnowledgeMarket' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: 'KnowledgeMarket — AI-Powered Expert Marketplace',
    description: 'Ask questions, compete with experts, earn rewards. Powered by AI.',
    siteName: 'KnowledgeMarket',
  },
  twitter: { card: 'summary_large_image', title: 'KnowledgeMarket', description: 'AI-Powered Expert Marketplace' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#ffffff' }, { media: '(prefers-color-scheme: dark)', color: '#0f172a' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('km-theme');var p=t||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');if(p==='dark')document.documentElement.classList.add('dark');})();` }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
