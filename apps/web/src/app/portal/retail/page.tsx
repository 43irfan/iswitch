import { PortalShell } from '@/components/portal-shell';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';
import { apiFetch, serverCookieHeader } from '@/lib/api';

export default async function RetailPortalPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
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
      title="Retail PBX"
    >
      <h2 className="text-xl font-semibold">{account.name}</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Company admin shell for extensions, DIDs, IVR, and queues (Phase 3).
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {['Extensions', 'DIDs', 'Call history'].map((label) => (
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
