import { PortalShell } from '@/components/portal-shell';
import { UserRole } from '@iswitch/shared';
import { getPortalShell, requireUser } from '@/lib/session';

export default async function AdminResellersPage() {
  await requireUser(UserRole.SUPER_ADMIN);
  const shell = await getPortalShell();
  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Resellers"
    >
      <h2 className="text-xl font-semibold">Resellers</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Placeholder shell — CRUD arrives with later phases.
      </p>
    </PortalShell>
  );
}
