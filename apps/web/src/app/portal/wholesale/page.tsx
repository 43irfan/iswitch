import { PortalShell } from '@/components/portal-shell';
import { CreateTrunkForm } from '@/components/create-trunk-form';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';
import Link from 'next/link';

export default async function WholesalePortalPage() {
  await requireUser(UserRole.WHOLESALE_CUSTOMER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const [billing, trunks] = await Promise.all([
    apiFetch<{
      name: string;
      billingMode: string;
      balanceMicros: string;
      creditCheck: { allowed: boolean; reason?: string };
      maxChannels: number;
      maxCps: number;
    }>('/wholesale/billing', { cookieHeader }),
    apiFetch<unknown[]>('/wholesale/trunks', { cookieHeader }),
  ]);

  const balance = (Number(billing.balanceMicros) / 1_000_000).toFixed(2);

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Wholesale"
    >
      <h2 className="text-xl font-semibold">{billing.name}</h2>
      <p className="mt-2 text-sm text-zinc-400">
        SIP trunking with channel/CPS limits and prepaid credit cut-off.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">Balance</p>
          <p className="mt-2 text-3xl font-semibold">${balance}</p>
          <p className="mt-1 text-xs text-zinc-500">{billing.billingMode}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">Credit check</p>
          <p
            className={`mt-2 text-xl font-semibold ${
              billing.creditCheck.allowed ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {billing.creditCheck.allowed ? 'Allowed' : 'Blocked'}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {billing.creditCheck.reason ?? 'OK to place calls'}
          </p>
        </div>
        <Link
          href="/portal/wholesale/trunks"
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-600"
        >
          <p className="text-sm text-zinc-400">SIP trunks</p>
          <p className="mt-2 text-3xl font-semibold">{trunks.length}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Cap {billing.maxChannels} ch / {billing.maxCps} CPS
          </p>
        </Link>
      </div>
      <CreateTrunkForm />
    </PortalShell>
  );
}
