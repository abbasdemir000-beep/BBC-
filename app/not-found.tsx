import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md text-center space-y-6">
        <div className="text-8xl font-black" style={{ color: 'var(--border)' }}>404</div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Page not found</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
