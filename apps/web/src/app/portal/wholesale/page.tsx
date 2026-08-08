import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

export default async function WholesalePortalPage() {
  await requireUser(UserRole.WHOLESALE_CUSTOMER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const account = await apiFetch<{ name: string; type: string; status: string }>(
    '/accounts/me',
    { cookieHeader },
  );

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Wholesale"
    >
      <h2 className="text-xl font-semibold">{account.name}</h2>
      <p className="mt-2 text-sm text-zinc-400">
        SIP trunks, capacity, and termination routing arrive in Phase 4.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {['Trunks', 'Capacity', 'CDRs'].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400"
          >
            {label} — coming soon
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
