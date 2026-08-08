import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/page-header';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import type { UserRole as Role } from '@iswitch/shared';

type CdrRow = {
  id: string;
  uniqueId: string;
  direction: string;
  caller: string;
  callee: string;
  billsec: number;
  billableMinutes: number;
  disposition: string | null;
  rateMicros: string | null;
  chargeMicros: string;
  status: string;
  createdAt: string;
};

type Summary = {
  count: number;
  totalBillsec: number;
  totalChargeMicros: string;
  totalChargeUsd: string;
};

export async function CdrsPage({
  role,
  title,
}: {
  role: Role | Role[];
  title: string;
}) {
  await requireUser(role);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const [cdrs, summary] = await Promise.all([
    apiFetch<CdrRow[]>('/billing/cdrs', { cookieHeader }),
    apiFetch<Summary>('/billing/summary', { cookieHeader }).catch(() => ({
      count: 0,
      totalBillsec: 0,
      totalChargeMicros: '0',
      totalChargeUsd: '0.0000',
    })),
  ]);

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title={title}
    >
      <PageHeader
        kicker="Billing"
        title="Call detail records"
        description="Rated with longest-prefix routes; charges in micros (60s rounding)."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="stat">
          <p className="label">CDRs</p>
          <p className="value">{summary.count}</p>
        </div>
        <div className="stat">
          <p className="label">Billsec</p>
          <p className="value">{summary.totalBillsec}s</p>
        </div>
        <div className="stat">
          <p className="label">Charged</p>
          <p className="value">${summary.totalChargeUsd}</p>
        </div>
      </div>
      <div className="table-wrap mt-8">
        <table>
          <thead>
            <tr>
              <th>Caller → Callee</th>
              <th>Duration</th>
              <th>Rate</th>
              <th>Charge</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {cdrs.map((c) => (
              <tr key={c.id}>
                <td>
                  <span className="mono">
                    {c.caller} → {c.callee}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--ink-faint)]">
                    {c.direction} · {c.disposition ?? '—'}
                  </span>
                </td>
                <td className="text-[var(--ink-soft)]">
                  {c.billsec}s ({c.billableMinutes} min)
                </td>
                <td className="text-[var(--ink-soft)]">
                  {c.rateMicros
                    ? `$${(Number(c.rateMicros) / 1_000_000).toFixed(4)}`
                    : '—'}
                </td>
                <td className="font-semibold">
                  ${(Number(c.chargeMicros) / 1_000_000).toFixed(4)}
                </td>
                <td className="text-[var(--ink-soft)]">{c.status}</td>
              </tr>
            ))}
            {cdrs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--ink-faint)]">
                  No CDRs yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
