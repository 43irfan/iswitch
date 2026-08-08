import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type CdrRow = {
  id: string;
  caller: string;
  callee: string;
  billsec: number;
  chargeMicros: string;
  disposition: string | null;
};

export default async function EndUserCallsPage() {
  await requireUser(UserRole.END_USER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const cdrs = await apiFetch<CdrRow[]>('/billing/cdrs', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Call history"
    >
      <PageHeader title="Your calls" description="Account-scoped CDR history." />
      <DataTable
        columns={['Caller → Callee', 'Duration', 'Disposition', 'Charge']}
        emptyTitle="No calls yet"
        rows={cdrs.map((c) => (
          <tr key={c.id}>
            <td className="mono">
              {c.caller} → {c.callee}
            </td>
            <td className="mono">{c.billsec}s</td>
            <td>{c.disposition ?? '—'}</td>
            <td className="mono">
              ${(Number(c.chargeMicros) / 1_000_000).toFixed(4)}
            </td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
