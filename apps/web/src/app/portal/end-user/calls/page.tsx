import { PortalShell } from '@/components/portal-shell';
import { UserRole } from '@iswitch/shared';
import { getPortalShell, requireUser } from '@/lib/session';

export default async function EndUserCallsPage() {
  await requireUser(UserRole.END_USER);
  const shell = await getPortalShell();
  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Call history"
    >
      <h2 className="text-xl font-semibold">Call history</h2>
      <p className="mt-2 text-sm text-zinc-400">Placeholder — CDRs in billing phase.</p>
    </PortalShell>
  );
}
