import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
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
      <PageHeader
        title="Customers"
        description="Dedicated customer management expands later."
      />
      <EmptyState
        title="See Overview"
        description="Your reseller overview lists retail and wholesale accounts."
        action={
          <Link href="/portal/reseller" className="btn btn-primary">
            Open overview
          </Link>
        }
      />
    </PortalShell>
  );
}
