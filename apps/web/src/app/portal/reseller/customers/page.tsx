import { PortalShell } from '@/components/portal-shell';
import { UserRole } from '@iswitch/shared';
import { getPortalShell, requireUser } from '@/lib/session';

export default async function ResellerCustomersPage() {
  await requireUser(UserRole.RESELLER);
  const shell = await getPortalShell();
  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Customers"
    >
      <h2 className="text-xl font-semibold">Customers</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Placeholder — customer management expands in retail/wholesale phases.
      </p>
    </PortalShell>
  );
}
