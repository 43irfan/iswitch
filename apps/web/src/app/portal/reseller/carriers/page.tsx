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
  syncStatus: string;
};

export default async function ResellerCarriersPage() {
  await requireUser(UserRole.RESELLER);
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
      title="Carriers"
    >
      <h2 className="text-xl font-semibold">Upstream carriers</h2>
      <ul className="mt-6 space-y-2">
        {carriers.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm"
          >
            <span className="font-medium">{c.name}</span>
            <span className="ml-2 text-zinc-500">
              {c.host}:{c.port} · {c.maxChannels} ch · {c.syncStatus}
            </span>
          </li>
        ))}
        {carriers.length === 0 ? (
          <li className="text-sm text-zinc-500">No carriers in your scope yet.</li>
        ) : null}
      </ul>
    </PortalShell>
  );
}
