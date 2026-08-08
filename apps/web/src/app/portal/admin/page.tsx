import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/page-header';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

export default async function AdminPortalPage() {
  await requireUser(UserRole.SUPER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const children = await apiFetch<
    {
      id: string;
      name: string;
      type: string;
      status: string;
      _count: { children: number; users: number };
    }[]
  >('/accounts/children', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Super Admin"
    >
      <PageHeader
        kicker="Platform"
        title="Overview"
        description="Manage resellers, system health, and global configuration."
      />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reseller</th>
              <th>Status</th>
              <th>Customers</th>
              <th>Users</th>
            </tr>
          </thead>
          <tbody>
            {children.map((row) => (
              <tr key={row.id}>
                <td className="font-semibold">{row.name}</td>
                <td className="text-[var(--ink-soft)]">{row.status}</td>
                <td className="text-[var(--ink-soft)]">{row._count.children}</td>
                <td className="text-[var(--ink-soft)]">{row._count.users}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
