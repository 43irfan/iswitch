import { PortalShell } from '@/components/portal-shell';
import { UserRole } from '@iswitch/shared';
import { getPortalShell, requireUser } from '@/lib/session';

export default async function WholesaleTrunksPage() {
  await requireUser(UserRole.WHOLESALE_CUSTOMER);
  const shell = await getPortalShell();
  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Trunks"
    >
      <h2 className="text-xl font-semibold">Trunks</h2>
      <p className="mt-2 text-sm text-zinc-400">Placeholder shell for Phase 4.</p>
    </PortalShell>
  );
}
