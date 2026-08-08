import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
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
      <PageHeader
        title="Resellers"
        description="Full reseller CRUD expands in a later phase."
      />
      <EmptyState
        title="Use Overview for now"
        description="The platform overview lists reseller accounts in your tree."
        action={
          <Link href="/portal/admin" className="btn btn-primary">
            Open overview
          </Link>
        }
      />
    </PortalShell>
  );
}
