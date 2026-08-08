import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import type { UserRole as Role } from '@iswitch/shared';

type CdrRow = {
  id: string;
  uniqueId: string;
  direction: string;
  caller: string;
  callee: string;
  billsec: number;
  billableMinutes: number;
  disposition: string | null;
  rateMicros: string | null;
  chargeMicros: string;
  status: string;
  createdAt: string;
};

type Summary = {
  count: number;
  totalBillsec: number;
  totalChargeMicros: string;
  totalChargeUsd: string;
};

export async function CdrsPage({
  role,
  title,
}: {
  role: Role | Role[];
  title: string;
}) {
  await requireUser(role);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const [cdrs, summary] = await Promise.all([
    apiFetch<CdrRow[]>('/billing/cdrs', { cookieHeader }),
    apiFetch<Summary>('/billing/summary', { cookieHeader }).catch(() => ({
      count: 0,
      totalBillsec: 0,
      totalChargeMicros: '0',
      totalChargeUsd: '0.0000',
    })),
  ]);

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title={title}
    >
      <h2 className="text-xl font-semibold">Call detail records</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Rated with longest-prefix routes; charges in micros (60s rounding).
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">CDRs</p>
          <p className="mt-1 text-2xl font-semibold">{summary.count}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">Billsec</p>
          <p className="mt-1 text-2xl font-semibold">{summary.totalBillsec}s</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">Charged</p>
          <p className="mt-1 text-2xl font-semibold">${summary.totalChargeUsd}</p>
        </div>
      </div>
      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Caller → Callee</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Charge</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {cdrs.map((c) => (
              <tr key={c.id} className="border-t border-zinc-800">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs">
                    {c.caller} → {c.callee}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {c.direction} · {c.disposition ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {c.billsec}s ({c.billableMinutes} min)
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {c.rateMicros
                    ? `$${(Number(c.rateMicros) / 1_000_000).toFixed(4)}`
                    : '—'}
                </td>
                <td className="px-4 py-3 font-medium">
                  ${(Number(c.chargeMicros) / 1_000_000).toFixed(4)}
                </td>
                <td className="px-4 py-3 text-zinc-400">{c.status}</td>
              </tr>
            ))}
            {cdrs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-zinc-500">
                  No CDRs yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
