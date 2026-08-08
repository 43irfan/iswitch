import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';
import Link from 'next/link';

export default async function RetailPortalPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const [account, extensions, dids, ringGroups, queues, ivr] =
    await Promise.all([
      apiFetch<{ name: string; status: string }>('/accounts/me', {
        cookieHeader,
      }),
      apiFetch<unknown[]>('/retail/extensions', { cookieHeader }),
      apiFetch<unknown[]>('/retail/dids', { cookieHeader }),
      apiFetch<unknown[]>('/retail/ring-groups', { cookieHeader }),
      apiFetch<unknown[]>('/retail/queues', { cookieHeader }),
      apiFetch<unknown[]>('/retail/ivr', { cookieHeader }),
    ]);

  const cards = [
    { href: '/portal/retail/extensions', label: 'Extensions', count: extensions.length },
    { href: '/portal/retail/dids', label: 'DIDs', count: dids.length },
    { href: '/portal/retail/ring-groups', label: 'Ring groups', count: ringGroups.length },
    { href: '/portal/retail/queues', label: 'Queues', count: queues.length },
    { href: '/portal/retail/ivr', label: 'IVR menus', count: ivr.length },
  ];

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Retail PBX"
    >
      <h2 className="text-xl font-semibold">{account.name}</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Phase 3 retail core — extensions, DIDs, ring groups, queues, IVR with
        Asterisk sync queue.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-600"
          >
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.count}</p>
          </Link>
        ))}
      </div>
    </PortalShell>
  );
}
