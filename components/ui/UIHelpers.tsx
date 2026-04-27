'use client';

/* ── StarRating ────────────────────────────────────────────────────────── */
export function StarRating({
  value,
  max = 5,
  onChange,
  readOnly = false,
  size = 'md',
}: {
  value: number;
  max?: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`${sizes[size]} transition-opacity ${readOnly ? 'cursor-default' : 'hover:opacity-70 cursor-pointer'}`}
          style={{ color: star <= value ? 'var(--accent)' : 'var(--border-medium)', lineHeight: 1 }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ── SectionHeader ─────────────────────────────────────────────────────── */
export function SectionHeader({
  label,
  title,
  subtitle,
  action,
}: {
  label?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-8 pb-5"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div>
        {label && <p className="tag-editorial mb-2">{label}</p>}
        <h2 className="font-display text-3xl font-light italic" style={{ color: 'var(--ink)' }}>{title}</h2>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/* ── Divider ───────────────────────────────────────────────────────────── */
export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="divider-editorial" />;
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />
      <span className="section-label px-2">{label}</span>
      <div className="flex-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />
    </div>
  );
}

/* ── EmptyState ────────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  return (
    <div className="py-20 text-center">
      {icon && <div className="text-4xl mb-4 opacity-30">{icon}</div>}
      <p className="font-display text-2xl font-light italic mb-2" style={{ color: 'var(--ink)' }}>{title}</p>
      {subtitle && <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>{subtitle}</p>}
    </div>
  );
}
