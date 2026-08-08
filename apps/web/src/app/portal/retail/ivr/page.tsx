import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type Ivr = {
  id: string;
  name: string;
  greetingPrompt: string;
  timeoutSeconds: number;
  options: Record<string, { type: string; ref: string }>;
  syncStatus: string;
};

export default async function RetailIvrPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const menus = await apiFetch<Ivr[]>('/retail/ivr', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="IVR"
    >
      <PageHeader
        title="Auto-attendant / IVR"
        description="Digit menus in App DB · dialplan sync queued to Asterisk."
      />
      <DataTable
        columns={['Name', 'Prompt', 'Options', 'Sync']}
        emptyTitle="No IVR menus"
        rows={menus.map((menu) => (
          <tr key={menu.id}>
            <td style={{ fontWeight: 520 }}>{menu.name}</td>
            <td className="mono">
              {menu.greetingPrompt} · {menu.timeoutSeconds}s
            </td>
            <td className="mono faint">
              {Object.keys(menu.options ?? {}).join(', ') || '—'}
            </td>
            <td>
              <span className="badge">{menu.syncStatus}</span>
            </td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
