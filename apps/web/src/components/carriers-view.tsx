import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type Carrier = {
  id: string;
  name: string;
  host: string;
  port: number;
  maxChannels: number;
  maxCps: number;
  priority: number;
  syncStatus: string;
};

export async function CarriersView({
  role,
  title,
}: {
  role: typeof UserRole.SUPER_ADMIN | typeof UserRole.RESELLER;
  title: string;
}) {
  await requireUser(role);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const carriers = await apiFetch<Carrier[]>('/wholesale/carriers', {
    cookieHeader,
  });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title={title}
    >
      <PageHeader
        title="Upstream carriers"
        description="Vendor trunks for wholesale termination."
      />
      <DataTable
        columns={['Name', 'Host', 'Capacity', 'Priority', 'Sync']}
        emptyTitle="No carriers"
        rows={carriers.map((c) => (
          <tr key={c.id}>
            <td style={{ fontWeight: 520 }}>{c.name}</td>
            <td className="mono">
              {c.host}:{c.port}
            </td>
            <td className="mono">
              {c.maxChannels} ch / {c.maxCps} cps
            </td>
            <td className="mono">{c.priority}</td>
            <td>
              <span className="badge">{c.syncStatus}</span>
            </td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
