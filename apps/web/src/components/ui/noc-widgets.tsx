import Link from 'next/link';

export type NocTone = 'ok' | 'warn' | 'danger' | 'neutral';

export function NocGrid({ children }: { children: React.ReactNode }) {
  return <div className="noc-grid">{children}</div>;
}

export function NocWidget({
  label,
  value,
  meta,
  tone = 'neutral',
  span = 3,
  href,
  actionLabel,
}: {
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  tone?: NocTone;
  span?: 3 | 4 | 6 | 8 | 12;
  href?: string;
  actionLabel?: string;
}) {
  const spanClass =
    span === 3 ? '' : span === 4 ? ' span-4' : span === 6 ? ' span-6' : span === 8 ? ' span-8' : ' span-12';
  const toneClass = tone === 'neutral' ? '' : ` ${tone}`;

  return (
    <div className={`noc-widget${spanClass}${toneClass}`}>
      <div className="w-label">
        <span>{label}</span>
        {tone !== 'neutral' ? (
          <span className={`badge ${tone === 'ok' ? 'ok' : tone === 'warn' ? 'warn' : 'danger'}`}>
            {tone}
          </span>
        ) : null}
      </div>
      <div className="w-value">{value}</div>
      {(meta || href) && (
        <div className="w-meta">
          {meta}
          {href ? (
            <>
              {meta ? ' · ' : null}
              <Link href={href}>{actionLabel ?? 'Open'}</Link>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function StatusChip({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: NocTone;
}) {
  const cls =
    tone === 'neutral' ? 'status-chip' : `status-chip ${tone === 'ok' ? 'ok' : tone === 'warn' ? 'warn' : 'danger'}`;
  return (
    <span className={cls}>
      <span className="dot" />
      {label}
    </span>
  );
}

export function AlertItem({
  title,
  description,
  tone = 'warn',
}: {
  title: string;
  description?: string;
  tone?: 'warn' | 'danger';
}) {
  return (
    <div className={`alert-item ${tone}`}>
      <div>
        <div className="title">{title}</div>
        {description ? <div className="desc">{description}</div> : null}
      </div>
    </div>
  );
}
