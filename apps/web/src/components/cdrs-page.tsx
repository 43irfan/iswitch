import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { KpiStrip } from '@/components/ui/kpi-strip';
import { DataTable } from '@/components/ui/data-table';
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
        title="Call detail records"
        description="Longest-prefix rating · micros · 60s rounding."
      />
      <KpiStrip
        items={[
          { label: 'CDRs', value: summary.count, hero: true },
          { label: 'Billsec', value: `${summary.totalBillsec}s` },
          { label: 'Charged', value: `$${summary.totalChargeUsd}` },
        ]}
      />
      <DataTable
        columns={['Caller → Callee', 'Duration', 'Rate', 'Charge', 'Status']}
        emptyTitle="No CDRs yet"
        emptyDescription="Ingest rated calls from Asterisk or POST /billing/cdrs."
        rows={cdrs.map((c) => (
          <tr key={c.id}>
            <td>
              <span className="mono">
                {c.caller} → {c.callee}
              </span>
              <div className="faint" style={{ fontSize: 11, marginTop: 2 }}>
                {c.direction} · {c.disposition ?? '—'}
              </div>
            </td>
            <td className="mono">
              {c.billsec}s ({c.billableMinutes}m)
            </td>
            <td className="mono">
              {c.rateMicros
                ? `$${(Number(c.rateMicros) / 1_000_000).toFixed(4)}`
                : '—'}
            </td>
            <td className="mono">
              ${(Number(c.chargeMicros) / 1_000_000).toFixed(4)}
            </td>
            <td>
              <span className={`badge${c.status === 'RATED' ? ' ok' : ''}`}>
                {c.status}
              </span>
            </td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
