import { PortalShell } from '@/components/portal-shell';
import { UserRole } from '@iswitch/shared';
import { getPortalShell, requireUser } from '@/lib/session';
import { apiFetch, serverCookieHeader } from '@/lib/api';

export default async function AdminSystemPage() {
  await requireUser(UserRole.SUPER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  let asterisk: Record<string, unknown> | null = null;
  try {
    asterisk = await apiFetch('/asterisk/status', { cookieHeader });
  } catch {
    asterisk = null;
  }

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="System"
    >
      <h2 className="text-xl font-semibold">System status</h2>
      <pre className="mt-4 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-xs text-zinc-300">
        {JSON.stringify(asterisk, null, 2)}
      </pre>
    </PortalShell>
  );
}
