import { PortalShell } from '@/components/portal-shell';
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
      <h2 className="text-xl font-semibold">Platform overview</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Manage resellers, system health, and global configuration.
      </p>
      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Reseller</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Customers</th>
              <th className="px-4 py-3 font-medium">Users</th>
            </tr>
          </thead>
          <tbody>
            {children.map((row) => (
              <tr key={row.id} className="border-t border-zinc-800">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3 text-zinc-400">{row.status}</td>
                <td className="px-4 py-3 text-zinc-400">{row._count.children}</td>
                <td className="px-4 py-3 text-zinc-400">{row._count.users}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
