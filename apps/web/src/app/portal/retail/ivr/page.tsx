import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type Ivr = {
  id: string;
  name: string;
  greetingPrompt: string;
  timeoutSeconds: number;
  options: Record<string, { type: string; ref: string }>;
  syncStatus: string;
};

export default async function RetailIvrPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const menus = await apiFetch<Ivr[]>('/retail/ivr', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="IVR"
    >
      <h2 className="text-xl font-semibold">Auto-attendant / IVR</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Digit menus stored in App DB; dialplan sync is queued to Asterisk.
      </p>
      <ul className="mt-6 space-y-3">
        {menus.map((menu) => (
          <li
            key={menu.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
          >
            <p className="font-medium">{menu.name}</p>
            <p className="text-sm text-zinc-500">
              Prompt {menu.greetingPrompt} · timeout {menu.timeoutSeconds}s ·{' '}
              {menu.syncStatus}
            </p>
            <pre className="mt-2 overflow-auto text-xs text-zinc-400">
              {JSON.stringify(menu.options, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </PortalShell>
  );
}
