import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
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
import { SignalCommand } from '@/components/ui/signal-command';

export default async function AdminPortalPage() {
  await requireUser(UserRole.SUPER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();

  const [children, summary, overview, health] = await Promise.all([
    apiFetch<
      {
        id: string;
        name: string;
        type: string;
        status: string;
        _count: { children: number; users: number };
      }[]
    >('/accounts/children', { cookieHeader }),
    apiFetch<{ count: number; totalChargeUsd: string; totalBillsec: number }>(
      '/billing/summary',
      { cookieHeader },
    ).catch(() => ({ count: 0, totalChargeUsd: '0.0000', totalBillsec: 0 })),
    apiFetch<{
      counts: {
        pendingSync: number;
        cdrs: number;
        destinationBlocks: number;
        accounts: number;
        trunks: number;
      };
      readiness: {
        status: string;
        database: string;
        redis: string;
        asterisk: { connected?: boolean; configured?: boolean };
      };
      failedSync: { id: string; message: string | null }[];
    }>('/ops/overview', { cookieHeader }).catch(() => null),
    apiFetch<{ status: string; database?: string; redis?: string }>('/health', {
      cookieHeader,
    }).catch(() => null),
  ]);

  const ready = overview?.readiness.status === 'ready';
  const pending = overview?.counts.pendingSync ?? 0;
  const blocks = overview?.counts.destinationBlocks ?? 0;
  const failed = overview?.failedSync?.length ?? 0;
  const customers = children.reduce((n, r) => n + r._count.children, 0);

  const alerts: { title: string; description: string; tone: 'warn' | 'danger' }[] =
    [];
  if (!ready) {
    alerts.push({
      title: 'Control plane not ready',
      description: `DB ${overview?.readiness.database ?? 'unknown'} · Redis ${overview?.readiness.redis ?? 'unknown'}`,
      tone: 'danger',
    });
  }
  if (pending > 0) {
    alerts.push({
      title: `${pending} pending Asterisk sync jobs`,
      description: 'Configs waiting while Asterisk is offline or stubbed.',
      tone: 'warn',
    });
  }
  if (failed > 0) {
    alerts.push({
      title: `${failed} recent sync failures`,
      description: 'Review System → Recent sync and retry.',
      tone: 'danger',
    });
  }
  if (blocks > 0) {
    alerts.push({
      title: `${blocks} destination blocks active`,
      description: 'Fraud prefix filters are enforcing call cut-off.',
      tone: 'warn',
    });
  }

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="NOC dashboard"
    >
      <PageHeader
        title="Operator dashboard"
        description="Softswitch status, finance pulse, and alerts — IXC-style NOC home."
        actions={
          <Link href="/portal/admin/system" className="btn btn-primary">
            System console
          </Link>
        }
      />

      <SignalCommand
        eyebrow="Global control plane"
        title={ready ? 'All systems in rhythm.' : 'Your attention is required.'}
        description="Live infrastructure health, switching activity, and commercial traffic across the entire iSwitch network."
        primaryLabel="Network readiness"
        primaryValue={ready ? '99.99%' : 'Degraded'}
        primaryDetail={ready ? 'All critical services operational' : 'One or more services need attention'}
        healthy={ready}
        metrics={[
          { label: 'CUSTOMER TRUNKS', value: overview?.counts.trunks ?? '—', detail: 'Provisioned' },
          { label: 'CDR EVENTS', value: overview?.counts.cdrs ?? summary.count, detail: 'Rated records' },
          { label: 'ACCOUNTS', value: overview?.counts.accounts ?? '—', detail: 'Across network' },
        ]}
        href="/portal/admin/system"
        actionLabel="Inspect network"
      />

      <NocGrid>
        <NocWidget
          label="Softswitch"
          value={ready ? 'Ready' : 'Degraded'}
          tone={ready ? 'ok' : 'danger'}
          span={4}
          meta={
            <div className="status-row">
              <StatusChip
                label={`DB ${overview?.readiness.database ?? health?.database ?? '—'}`}
                tone={overview?.readiness.database === 'ok' ? 'ok' : 'danger'}
              />
              <StatusChip
                label={`Redis ${overview?.readiness.redis ?? health?.redis ?? '—'}`}
                tone={overview?.readiness.redis === 'ok' ? 'ok' : 'danger'}
              />
              <StatusChip
                label={
                  overview?.readiness.asterisk?.connected
                    ? 'Asterisk up'
                    : 'Asterisk stub'
                }
                tone={
                  overview?.readiness.asterisk?.connected ? 'ok' : 'warn'
                }
              />
            </div>
          }
          href="/portal/admin/system"
          actionLabel="Diagnostics"
        />
        <NocWidget
          label="CPS / capacity pulse"
          value={overview?.counts.trunks ?? '—'}
          span={4}
          meta="Customer trunks provisioned · live CPS arrives with Asterisk"
          tone="neutral"
          href="/portal/admin/carriers"
          actionLabel="Carriers"
        />
        <NocWidget
          label="Balance / traffic"
          value={`$${summary.totalChargeUsd}`}
          span={4}
          meta={`${summary.count} CDRs · ${summary.totalBillsec}s billsec`}
          tone="ok"
          href="/portal/admin/cdrs"
          actionLabel="CDRs"
        />
        <NocWidget
          label="Pending sync"
          value={pending}
          tone={pending > 0 ? 'warn' : 'ok'}
          span={3}
          meta="Asterisk apply queue"
          href="/portal/admin/system"
        />
        <NocWidget
          label="Fraud blocks"
          value={blocks}
          tone={blocks > 0 ? 'warn' : 'ok'}
          span={3}
          href="/portal/admin/system"
          actionLabel="Manage"
        />
        <NocWidget
          label="Resellers"
          value={children.length}
          span={3}
          meta={`${customers} customers`}
        />
        <NocWidget
          label="Accounts"
          value={overview?.counts.accounts ?? '—'}
          span={3}
        />
      </NocGrid>

      {alerts.length > 0 ? (
        <section style={{ marginBottom: 16 }}>
          <PageHeader title="Alerts" />
          <div className="alert-list">
            {alerts.map((a) => (
              <AlertItem
                key={a.title}
                title={a.title}
                description={a.description}
                tone={a.tone}
              />
            ))}
          </div>
        </section>
      ) : null}

      <PageHeader title="Reseller tree" />
      <DataTable
        columns={['Reseller', 'Status', 'Customers', 'Users']}
        emptyTitle="No resellers"
        emptyDescription="Create reseller accounts under the platform tree."
        rows={children.map((row) => (
          <tr key={row.id}>
            <td style={{ fontWeight: 600 }}>{row.name}</td>
            <td>
              <span className={`badge${row.status === 'ACTIVE' ? ' ok' : ' warn'}`}>
                {row.status}
              </span>
            </td>
            <td className="mono">{row._count.children}</td>
            <td className="mono">{row._count.users}</td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
