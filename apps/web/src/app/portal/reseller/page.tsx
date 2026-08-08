import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

export default async function ResellerPortalPage() {
  await requireUser(UserRole.RESELLER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const children = await apiFetch<
    { id: string; name: string; type: string; status: string }[]
  >('/accounts/children', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Reseller"
    >
      <h2 className="text-xl font-semibold">Your customers</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Retail and wholesale accounts under your reseller tree.
      </p>
      <ul className="mt-6 space-y-2">
        {children.map((c) => (
          <li
            key={c.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm"
          >
            <span className="font-medium">{c.name}</span>
            <span className="ml-2 text-zinc-500">
              {c.type} · {c.status}
            </span>
          </li>
        ))}
      </ul>
    </PortalShell>
  );
}
