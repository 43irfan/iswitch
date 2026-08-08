import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type CdrRow = {
  id: string;
  caller: string;
  callee: string;
  billsec: number;
  chargeMicros: string;
  disposition: string | null;
};

export default async function EndUserCallsPage() {
  await requireUser(UserRole.END_USER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const cdrs = await apiFetch<CdrRow[]>('/billing/cdrs', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Call history"
    >
      <h2 className="text-xl font-semibold">Your account calls</h2>
      <ul className="mt-6 space-y-2">
        {cdrs.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm"
          >
            <span className="font-mono text-xs">
              {c.caller} → {c.callee}
            </span>
            <span className="ml-2 text-zinc-500">
              {c.billsec}s · {c.disposition ?? '—'} · $
              {(Number(c.chargeMicros) / 1_000_000).toFixed(4)}
            </span>
          </li>
        ))}
        {cdrs.length === 0 ? (
          <li className="text-sm text-zinc-500">No calls yet.</li>
        ) : null}
      </ul>
    </PortalShell>
  );
}
