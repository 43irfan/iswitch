import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type RingGroup = {
  id: string;
  name: string;
  strategy: string;
  ringTimeout: number;
  syncStatus: string;
  members: { extension: { number: string } }[];
};

export default async function RetailRingGroupsPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const groups = await apiFetch<RingGroup[]>('/retail/ring-groups', {
    cookieHeader,
  });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Ring groups"
    >
      <PageHeader
        title="Ring groups"
        description="Simultaneous / hunt ringing across extensions."
      />
      <DataTable
        columns={['Name', 'Strategy', 'Members', 'Sync']}
        emptyTitle="No ring groups"
        rows={groups.map((g) => (
          <tr key={g.id}>
            <td style={{ fontWeight: 520 }}>{g.name}</td>
            <td className="mono">
              {g.strategy} · {g.ringTimeout}s
            </td>
            <td className="mono">
              {g.members.map((m) => m.extension.number).join(', ') || '—'}
            </td>
            <td>
              <span className="badge">{g.syncStatus}</span>
            </td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
