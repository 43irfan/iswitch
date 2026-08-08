import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

export default async function EndUserPortalPage() {
  await requireUser(UserRole.END_USER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const account = await apiFetch<{ name: string }>('/accounts/me', {
    cookieHeader,
  });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="My phone"
    >
      <h2 className="text-xl font-semibold">Self-care</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Account: {account.name}. Softphone credentials and voicemail come with
        retail Phase 3.
      </p>
    </PortalShell>
  );
}
