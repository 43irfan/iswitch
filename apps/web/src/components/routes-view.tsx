import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type Route = {
  id: string;
  prefix: string;
  rateMicros: string;
  costMicros: string;
  priority: number;
  carrierTrunk: { name: string; host: string };
};

export async function RoutesView({
  role,
  title,
}: {
  role: typeof UserRole.SUPER_ADMIN | typeof UserRole.RESELLER;
  title: string;
}) {
  await requireUser(role);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const routes = await apiFetch<Route[]>('/wholesale/routes', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title={title}
    >
      <PageHeader
        title="Prefix routes"
        description="Longest-prefix match · sell/cost rates in micros per minute."
      />
      <DataTable
        columns={['Prefix', 'Carrier', 'Sell / min', 'Cost / min', 'Priority']}
        emptyTitle="No routes"
        rows={routes.map((r) => (
          <tr key={r.id}>
            <td className="mono" style={{ fontWeight: 520 }}>
              {r.prefix}
            </td>
            <td>
              {r.carrierTrunk.name}
              <div className="mono faint">{r.carrierTrunk.host}</div>
            </td>
            <td className="mono">
              ${(Number(r.rateMicros) / 1_000_000).toFixed(4)}
            </td>
            <td className="mono">
              ${(Number(r.costMicros) / 1_000_000).toFixed(4)}
            </td>
            <td className="mono">{r.priority}</td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
