import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

export default async function WholesaleBillingPage() {
  await requireUser(UserRole.WHOLESALE_CUSTOMER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const billing = await apiFetch<{
    name: string;
    billingMode: string;
    balanceMicros: string;
    creditLimitMicros: string;
    maxChannels: number;
    maxCps: number;
    techPrefix: string | null;
    creditCheck: { allowed: boolean; reason?: string };
  }>('/wholesale/billing', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Balance"
    >
      <h2 className="text-xl font-semibold">Account balance & credit</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Prepaid cut-off uses integer micros (no floating-point money).
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <dt className="text-xs text-zinc-500">Balance</dt>
          <dd className="mt-1 text-2xl font-semibold">
            ${(Number(billing.balanceMicros) / 1_000_000).toFixed(2)}
          </dd>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <dt className="text-xs text-zinc-500">Credit limit</dt>
          <dd className="mt-1 text-2xl font-semibold">
            ${(Number(billing.creditLimitMicros) / 1_000_000).toFixed(2)}
          </dd>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <dt className="text-xs text-zinc-500">Mode / capacity</dt>
          <dd className="mt-1 text-sm text-zinc-300">
            {billing.billingMode} · {billing.maxChannels} channels ·{' '}
            {billing.maxCps} CPS
            {billing.techPrefix ? ` · tech ${billing.techPrefix}` : ''}
          </dd>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <dt className="text-xs text-zinc-500">Credit check</dt>
          <dd
            className={`mt-1 text-lg font-semibold ${
              billing.creditCheck.allowed ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {billing.creditCheck.allowed ? 'Calls allowed' : 'Calls blocked'}
          </dd>
          <p className="mt-1 text-xs text-zinc-500">
            {billing.creditCheck.reason ?? 'Balance OK'}
          </p>
        </div>
      </dl>
    </PortalShell>
  );
}
