import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type Queue = {
  id: string;
  name: string;
  extension: string | null;
  strategy: string;
  timeout: number;
  musicOnHold: string;
  syncStatus: string;
  members: { extension: { number: string } }[];
};

export default async function RetailQueuesPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const queues = await apiFetch<Queue[]>('/retail/queues', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Queues"
    >
      <PageHeader
        title="Call queues"
        description="Basic ACD queues with MoH and member extensions."
      />
      <DataTable
        columns={['Name', 'Strategy', 'Agents', 'Sync']}
        emptyTitle="No queues"
        rows={queues.map((q) => (
          <tr key={q.id}>
            <td style={{ fontWeight: 520 }}>
              {q.name}
              {q.extension ? ` (ext ${q.extension})` : ''}
            </td>
            <td className="mono">
              {q.strategy} · {q.timeout}s · {q.musicOnHold}
            </td>
            <td className="mono">
              {q.members.map((m) => m.extension.number).join(', ') || '—'}
            </td>
            <td>
              <span className="badge">{q.syncStatus}</span>
            </td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
