import { PortalShell } from '@/components/portal-shell';
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
  enabled: boolean;
  syncStatus: string;
};

async function CarriersView({
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
      <h2 className="text-xl font-semibold">Upstream carriers</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Vendor trunks used for wholesale termination routing.
      </p>
      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Host</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Sync</th>
            </tr>
          </thead>
          <tbody>
            {carriers.map((c) => (
              <tr key={c.id} className="border-t border-zinc-800">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                  {c.host}:{c.port}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {c.maxChannels} ch / {c.maxCps} CPS
                </td>
                <td className="px-4 py-3 text-zinc-400">{c.priority}</td>
                <td className="px-4 py-3 text-zinc-400">{c.syncStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}

export default async function AdminCarriersPage() {
  return <CarriersView role={UserRole.SUPER_ADMIN} title="Carriers" />;
}
