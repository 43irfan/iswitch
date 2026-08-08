import { PortalShell } from '@/components/portal-shell';
import { CreateExtensionForm } from '@/components/create-extension-form';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type ExtensionRow = {
  id: string;
  number: string;
  displayName: string | null;
  sipUsername: string;
  sipPassword: string;
  dnd: boolean;
  syncStatus: string;
};

export default async function RetailExtensionsPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const extensions = await apiFetch<ExtensionRow[]>('/retail/extensions', {
    cookieHeader,
  });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Extensions"
    >
      <PageHeader
        title="Extensions"
        description="PJSIP endpoints in App DB · queued for Asterisk sync."
      />
      <CreateExtensionForm />
      <DataTable
        columns={['Ext', 'Name', 'SIP user', 'Password', 'Sync']}
        emptyTitle="No extensions"
        emptyDescription="Add an extension to provision SIP credentials."
        rows={extensions.map((ext) => (
          <tr key={ext.id}>
            <td className="mono" style={{ fontWeight: 520 }}>
              {ext.number}
            </td>
            <td>
              {ext.displayName ?? '—'}
              {ext.dnd ? ' · DND' : ''}
            </td>
            <td className="mono">{ext.sipUsername}</td>
            <td className="mono faint">{ext.sipPassword}</td>
            <td>
              <span className="badge">{ext.syncStatus}</span>
            </td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
