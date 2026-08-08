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
  priority: number;
  enabled: boolean;
  carrierTrunk: { name: string; host: string };
};

async function RoutesView({
  role,
  title,
}: {
  role: typeof UserRole.SUPER_ADMIN | typeof UserRole.RESELLER;
  title: string;
}) {
  await requireUser(role);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const routes = await apiFetch<Route[]>('/wholesale/routes', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title={title}
    >
      <h2 className="text-xl font-semibold">Prefix routes</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Longest-prefix match with sell/cost rates in micros per minute.
      </p>
      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Prefix</th>
              <th className="px-4 py-3">Carrier</th>
              <th className="px-4 py-3">Sell / min</th>
              <th className="px-4 py-3">Cost / min</th>
              <th className="px-4 py-3">Priority</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.id} className="border-t border-zinc-800">
                <td className="px-4 py-3 font-mono">{r.prefix}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {r.carrierTrunk.name}
                  <span className="block text-xs text-zinc-600">
                    {r.carrierTrunk.host}
                  </span>
                </td>
                <td className="px-4 py-3">
                  ${(Number(r.rateMicros) / 1_000_000).toFixed(4)}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  ${(Number(r.costMicros) / 1_000_000).toFixed(4)}
                </td>
                <td className="px-4 py-3 text-zinc-400">{r.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}

export default async function AdminRoutesPage() {
  return <RoutesView role={UserRole.SUPER_ADMIN} title="Routes" />;
}
