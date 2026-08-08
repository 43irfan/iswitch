import { PortalShell } from '@/components/portal-shell';
import { CreateExtensionForm } from '@/components/create-extension-form';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type ExtensionRow = {
  id: string;
  number: string;
  displayName: string | null;
  sipUsername: string;
  sipPassword: string;
  callerId: string | null;
  dnd: boolean;
  syncStatus: string;
  user?: { email: string } | null;
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
      <h2 className="text-xl font-semibold">Extensions</h2>
      <p className="mt-2 text-sm text-zinc-400">
        PJSIP endpoints stored in App DB and queued for Asterisk sync.
      </p>
      <CreateExtensionForm />
      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Ext</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SIP user</th>
              <th className="px-4 py-3">Password</th>
              <th className="px-4 py-3">Sync</th>
            </tr>
          </thead>
          <tbody>
            {extensions.map((ext) => (
              <tr key={ext.id} className="border-t border-zinc-800">
                <td className="px-4 py-3 font-medium">{ext.number}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {ext.displayName ?? '—'}
                  {ext.dnd ? ' · DND' : ''}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{ext.sipUsername}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                  {ext.sipPassword}
                </td>
                <td className="px-4 py-3 text-zinc-400">{ext.syncStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
