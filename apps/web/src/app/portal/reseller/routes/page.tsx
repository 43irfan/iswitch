import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type Route = {
  id: string;
  prefix: string;
  description: string | null;
  rateMicros: string;
  costMicros: string;
  carrierTrunk: { name: string };
};

export default async function ResellerRoutesPage() {
  await requireUser(UserRole.RESELLER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const routes = await apiFetch<Route[]>('/wholesale/routes', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Routes"
    >
      <h2 className="text-xl font-semibold">Prefix routes</h2>
      <ul className="mt-6 space-y-2">
        {routes.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm"
          >
            <span className="font-mono font-medium">{r.prefix}</span>
            <span className="ml-2 text-zinc-500">
              → {r.carrierTrunk.name} · $
              {(Number(r.rateMicros) / 1_000_000).toFixed(4)}/min
            </span>
          </li>
        ))}
        {routes.length === 0 ? (
          <li className="text-sm text-zinc-500">No routes in your scope yet.</li>
        ) : null}
      </ul>
    </PortalShell>
  );
}
