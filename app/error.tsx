'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md text-center space-y-6">
        <div className="text-6xl">⚠️</div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Something went wrong</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 transition-all"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-2.5 rounded-xl font-semibold text-sm border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Go Home
          </a>
        </div>
        {error.digest && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
