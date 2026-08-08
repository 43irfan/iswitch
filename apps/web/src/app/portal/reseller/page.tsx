import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { NocGrid, NocWidget, StatusChip } from '@/components/ui/noc-widgets';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

export default async function ResellerPortalPage() {
  await requireUser(UserRole.RESELLER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const [children, summary] = await Promise.all([
    apiFetch<{ id: string; name: string; type: string; status: string }[]>(
      '/accounts/children',
      { cookieHeader },
    ),
    apiFetch<{ count: number; totalChargeUsd: string }>('/billing/summary', {
      cookieHeader,
    }).catch(() => ({ count: 0, totalChargeUsd: '0.0000' })),
  ]);

  const active = children.filter((c) => c.status === 'ACTIVE').length;
  const wholesale = children.filter((c) => c.type === 'WHOLESALE').length;
  const retail = children.filter((c) => c.type === 'RETAIL').length;

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="NOC dashboard"
    >
      <PageHeader
        title="Reseller NOC"
        description="Customer health, traffic, and routing under your tree."
        actions={
          <Link href="/portal/reseller/routes" className="btn">
            Routes
          </Link>
        }
      />
      <NocGrid>
        <NocWidget
          label="Customers"
          value={children.length}
          tone="ok"
          span={4}
          meta={
            <div className="status-row">
              <StatusChip label={`${active} active`} tone="ok" />
              <StatusChip label={`${retail} retail`} />
              <StatusChip label={`${wholesale} wholesale`} />
            </div>
          }
        />
        <NocWidget
          label="Traffic charged"
          value={`$${summary.totalChargeUsd}`}
          span={4}
          meta={`${summary.count} CDRs`}
          href="/portal/reseller/cdrs"
          actionLabel="CDRs"
        />
        <NocWidget
          label="Routing"
          value="Carriers"
          span={4}
          meta="Upstream termination under your scope"
          href="/portal/reseller/carriers"
          actionLabel="Open"
        />
      </NocGrid>
      <PageHeader title="Accounts" />
      <DataTable
        columns={['Account', 'Type', 'Status']}
        emptyTitle="No customers yet"
        rows={children.map((c) => (
          <tr key={c.id}>
            <td style={{ fontWeight: 600 }}>{c.name}</td>
            <td className="mono">{c.type}</td>
            <td>
              <span className={`badge${c.status === 'ACTIVE' ? ' ok' : ' warn'}`}>
                {c.status}
              </span>
            </td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
