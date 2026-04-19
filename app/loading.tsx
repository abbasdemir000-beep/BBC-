export default function Loading() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Sidebar skeleton */}
      <div className="hidden md:flex flex-col w-64 flex-shrink-0 p-4 gap-3" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
        <div className="h-10 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)', animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      </div>
      {/* Content skeleton */}
      <div className="flex-1 p-6 space-y-4">
        <div className="h-8 w-48 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)', animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)', animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
