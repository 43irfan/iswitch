import { PortalShell } from '@/components/portal-shell';
import { CreateDidForm } from '@/components/create-did-form';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type DidRow = {
  id: string;
  number: string;
  description: string | null;
  destinationType: string;
  destinationRef: string;
  enabled: boolean;
  syncStatus: string;
};

type ExtensionRow = {
  id: string;
  number: string;
  displayName: string | null;
};

export default async function RetailDidsPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const [dids, extensions] = await Promise.all([
    apiFetch<DidRow[]>('/retail/dids', { cookieHeader }),
    apiFetch<ExtensionRow[]>('/retail/extensions', { cookieHeader }),
  ]);

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="DIDs"
    >
      <h2 className="text-xl font-semibold">Inbound DIDs</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Map phone numbers to extensions, IVR, queues, or ring groups.
      </p>
      <CreateDidForm extensions={extensions} />
      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Number</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Sync</th>
            </tr>
          </thead>
          <tbody>
            {dids.map((did) => (
              <tr key={did.id} className="border-t border-zinc-800">
                <td className="px-4 py-3 font-mono text-xs">{did.number}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {did.description ?? '—'}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {did.destinationType} → {did.destinationRef.slice(0, 8)}…
                </td>
                <td className="px-4 py-3 text-zinc-400">{did.syncStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
