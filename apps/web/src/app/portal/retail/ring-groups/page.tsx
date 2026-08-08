import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type RingGroup = {
  id: string;
  name: string;
  strategy: string;
  ringTimeout: number;
  syncStatus: string;
  members: { extension: { number: string; displayName: string | null } }[];
};

export default async function RetailRingGroupsPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const groups = await apiFetch<RingGroup[]>('/retail/ring-groups', {
    cookieHeader,
  });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Ring groups"
    >
      <h2 className="text-xl font-semibold">Ring groups</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Simultaneous / hunt ringing across extensions.
      </p>
      <ul className="mt-6 space-y-3">
        {groups.map((g) => (
          <li
            key={g.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{g.name}</p>
                <p className="text-sm text-zinc-500">
                  {g.strategy} · timeout {g.ringTimeout}s · sync {g.syncStatus}
                </p>
              </div>
              <p className="text-sm text-zinc-400">
                {g.members.map((m) => m.extension.number).join(', ') || 'No members'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </PortalShell>
  );
}
