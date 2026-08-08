import { PortalShell } from '@/components/portal-shell';
import { UserRole } from '@iswitch/shared';
import { getPortalShell, requireUser } from '@/lib/session';

export default async function RetailPlaceholderPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const { section } = await params;
  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title={section}
    >
      <h2 className="text-xl font-semibold capitalize">{section}</h2>
      <p className="mt-2 text-sm text-zinc-400">Placeholder shell for Phase 3.</p>
    </PortalShell>
  );
}
