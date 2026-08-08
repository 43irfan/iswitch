import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { CreateTrunkForm } from '@/components/create-trunk-form';
import { DataTable } from '@/components/ui/data-table';
import {
  AlertItem,
  NocGrid,
  NocWidget,
  StatusChip,
} from '@/components/ui/noc-widgets';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type Trunk = {
  id: string;
  name: string;
  maxChannels: number;
  maxCps: number;
  syncStatus: string;
  enabled: boolean;
};

export default async function WholesalePortalPage() {
  await requireUser(UserRole.WHOLESALE_CUSTOMER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const [billing, trunks, summary] = await Promise.all([
    apiFetch<{
      name: string;
      billingMode: string;
      balanceMicros: string;
      creditCheck: { allowed: boolean; reason?: string };
      maxChannels: number;
      maxCps: number;
    }>('/wholesale/billing', { cookieHeader }),
    apiFetch<Trunk[]>('/wholesale/trunks', { cookieHeader }),
    apiFetch<{ count: number; totalChargeUsd: string }>('/billing/summary', {
      cookieHeader,
    }).catch(() => ({ count: 0, totalChargeUsd: '0.0000' })),
  ]);

  const balance = Number(billing.balanceMicros) / 1_000_000;
  const balanceTone =
    !billing.creditCheck.allowed
      ? 'danger'
      : balance < 10
        ? 'warn'
        : 'ok';

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="NOC dashboard"
    >
      <PageHeader
        title={billing.name}
        description="Wholesale trunking · prepaid cut-off · capacity limits."
        actions={
          <Link href="/portal/wholesale/billing" className="btn btn-primary">
            Balance
          </Link>
        }
      />

      {!billing.creditCheck.allowed ? (
        <div className="alert-list" style={{ marginBottom: 16 }}>
          <AlertItem
            title="Calls blocked — credit cut-off"
            description={billing.creditCheck.reason ?? 'Insufficient balance'}
            tone="danger"
          />
        </div>
      ) : balance < 10 ? (
        <div className="alert-list" style={{ marginBottom: 16 }}>
          <AlertItem
            title="Balance running low"
            description={`$${balance.toFixed(2)} remaining on ${billing.billingMode}`}
            tone="warn"
          />
        </div>
      ) : null}

      <NocGrid>
        <NocWidget
          label="Balance alert"
          value={`$${balance.toFixed(2)}`}
          tone={balanceTone}
          span={4}
          meta={
            <div className="status-row">
              <StatusChip
                label={billing.creditCheck.allowed ? 'Credit OK' : 'Cut-off'}
                tone={billing.creditCheck.allowed ? 'ok' : 'danger'}
              />
              <StatusChip label={billing.billingMode} />
            </div>
          }
          href="/portal/wholesale/billing"
        />
        <NocWidget
          label="CPS / channels"
          value={`${billing.maxCps} / ${billing.maxChannels}`}
          span={4}
          meta="Account max CPS · max channels"
        />
        <NocWidget
          label="Traffic"
          value={`$${summary.totalChargeUsd}`}
          span={4}
          meta={`${summary.count} CDRs`}
          href="/portal/wholesale/cdrs"
          actionLabel="CDRs"
        />
      </NocGrid>

      <PageHeader title="SIP trunks" />
      <CreateTrunkForm />
      <DataTable
        columns={['Name', 'Capacity', 'Sync', 'Enabled']}
        emptyTitle="No trunks"
        emptyDescription="Create a customer SIP trunk to start terminating."
        rows={trunks.map((t) => (
          <tr key={t.id}>
            <td style={{ fontWeight: 600 }}>{t.name}</td>
            <td className="mono">
              {t.maxChannels} ch / {t.maxCps} cps
            </td>
            <td>
              <span className="badge">{t.syncStatus}</span>
            </td>
            <td>
              <span className={`badge${t.enabled ? ' ok' : ' warn'}`}>
                {t.enabled ? 'on' : 'off'}
              </span>
            </td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
