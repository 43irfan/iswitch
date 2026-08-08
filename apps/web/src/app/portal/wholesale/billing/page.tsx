import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { KpiStrip } from '@/components/ui/kpi-strip';
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
      <PageHeader
        title="Balance & credit"
        description="Prepaid cut-off uses integer micros (no floating-point money)."
      />
      <KpiStrip
        items={[
          {
            label: 'Balance',
            value: `$${(Number(billing.balanceMicros) / 1_000_000).toFixed(2)}`,
            hero: true,
            hint: billing.billingMode,
          },
          {
            label: 'Credit limit',
            value: `$${(Number(billing.creditLimitMicros) / 1_000_000).toFixed(2)}`,
          },
          {
            label: 'Capacity',
            value: `${billing.maxChannels}/${billing.maxCps}`,
            hint: 'channels / CPS',
          },
          {
            label: 'Credit check',
            value: billing.creditCheck.allowed ? 'OK' : 'Blocked',
            hint: billing.creditCheck.reason ?? 'Balance OK',
          },
        ]}
      />
    </PortalShell>
  );
}
