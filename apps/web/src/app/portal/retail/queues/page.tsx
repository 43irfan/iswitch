import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type Queue = {
  id: string;
  name: string;
  extension: string | null;
  strategy: string;
  timeout: number;
  musicOnHold: string;
  syncStatus: string;
  members: { extension: { number: string } }[];
};

export default async function RetailQueuesPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const queues = await apiFetch<Queue[]>('/retail/queues', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Queues"
    >
      <h2 className="text-xl font-semibold">Call queues</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Basic ACD queues with MoH and member extensions.
      </p>
      <ul className="mt-6 space-y-3">
        {queues.map((q) => (
          <li
            key={q.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
          >
            <p className="font-medium">
              {q.name}
              {q.extension ? ` (ext ${q.extension})` : ''}
            </p>
            <p className="text-sm text-zinc-500">
              {q.strategy} · timeout {q.timeout}s · MoH {q.musicOnHold} ·{' '}
              {q.syncStatus}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Agents: {q.members.map((m) => m.extension.number).join(', ') || 'none'}
            </p>
          </li>
        ))}
      </ul>
    </PortalShell>
  );
}
