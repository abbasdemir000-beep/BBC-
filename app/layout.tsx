import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KnowledgeMarket — AI-Powered Expert Marketplace',
  description: 'Ask questions, compete with experts, earn rewards. Powered by AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
