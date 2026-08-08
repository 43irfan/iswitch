import { PortalShell } from '@/components/portal-shell';
import { CreateDidForm } from '@/components/create-did-form';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type Did = {
  id: string;
  number: string;
  description: string | null;
  destinationType: string;
  destinationRef: string | null;
  syncStatus: string;
};

type Extension = {
  id: string;
  number: string;
  displayName: string | null;
};

export default async function RetailDidsPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const [dids, extensions] = await Promise.all([
    apiFetch<Did[]>('/retail/dids', { cookieHeader }),
    apiFetch<Extension[]>('/retail/extensions', { cookieHeader }),
  ]);

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="DIDs"
    >
      <PageHeader
        title="DIDs"
        description="Inbound numbers routed to extensions or features."
      />
      <CreateDidForm extensions={extensions} />
      <DataTable
        columns={['Number', 'Destination', 'Description', 'Sync']}
        emptyTitle="No DIDs"
        rows={dids.map((did) => (
          <tr key={did.id}>
            <td className="mono" style={{ fontWeight: 520 }}>
              {did.number}
            </td>
            <td className="mono">
              {did.destinationType}
              {did.destinationRef ? ` / ${did.destinationRef.slice(0, 8)}` : ''}
            </td>
            <td className="muted">{did.description ?? '—'}</td>
            <td>
              <span className="badge">{did.syncStatus}</span>
            </td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
