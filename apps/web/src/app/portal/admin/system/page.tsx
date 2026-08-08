import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { KpiStrip } from '@/components/ui/kpi-strip';
import { DataTable } from '@/components/ui/data-table';
import { CreateBlockForm } from '@/components/create-block-form';
import { UserRole } from '@iswitch/shared';
import { getPortalShell, requireUser } from '@/lib/session';
import { apiFetch, serverCookieHeader } from '@/lib/api';

type Overview = {
  counts: Record<string, number>;
  recentSync: {
    id: string;
    entityType: string;
    entityId: string;
    status: string;
    message: string | null;
    createdAt: string;
  }[];
  readiness: {
    status: string;
    database: string;
    redis: string;
    asterisk: Record<string, unknown>;
  };
};

type AuditRow = {
  id: string;
  actorEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
};

type BlockRow = {
  id: string;
  accountId: string;
  prefix: string;
  reason: string | null;
  enabled: boolean;
};

export default async function AdminSystemPage() {
  await requireUser(UserRole.SUPER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();

  let overview: Overview | null = null;
  let audit: AuditRow[] = [];
  let blocks: BlockRow[] = [];
  let health: Record<string, unknown> | null = null;

  try {
    [overview, audit, blocks, health] = await Promise.all([
      apiFetch<Overview>('/ops/overview', { cookieHeader }),
      apiFetch<AuditRow[]>('/ops/audit?take=40', { cookieHeader }),
      apiFetch<BlockRow[]>('/ops/fraud/blocks', { cookieHeader }),
      apiFetch<Record<string, unknown>>('/health', { cookieHeader }),
    ]);
  } catch {
    overview = null;
  }

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="System"
    >
      <PageHeader
        title="Control plane"
        description="Readiness, destination blocks, sync stream, auth audit."
      />

      {overview ? (
        <div className="stack">
          <KpiStrip
            items={[
              {
                label: 'Status',
                value: overview.readiness.status,
                hero: true,
                hint: `db ${overview.readiness.database} · redis ${overview.readiness.redis}`,
              },
              { label: 'Pending sync', value: overview.counts.pendingSync ?? 0 },
              {
                label: 'Blocks',
                value: overview.counts.destinationBlocks ?? blocks.length,
              },
              { label: 'Audit events', value: overview.counts.auditCount ?? audit.length },
              { label: 'CDRs', value: overview.counts.cdrs ?? 0 },
              { label: 'Accounts', value: overview.counts.accounts ?? 0 },
            ]}
          />

          <section>
            <PageHeader title="Readiness detail" />
            <pre className="pre-block">
              {JSON.stringify({ health, readiness: overview.readiness }, null, 2)}
            </pre>
          </section>

          <section>
            <PageHeader title="Destination blocks" />
            <CreateBlockForm />
            <DataTable
              columns={['Prefix', 'Scope', 'Reason', 'Enabled']}
              emptyTitle="No blocks"
              emptyDescription="Add a global or account prefix block."
              rows={blocks.map((b) => (
                <tr key={b.id}>
                  <td className="mono" style={{ fontWeight: 520 }}>
                    {b.prefix}
                  </td>
                  <td className="mono">
                    {b.accountId ? b.accountId.slice(0, 8) : 'global'}
                  </td>
                  <td className="muted">{b.reason ?? '—'}</td>
                  <td>
                    <span className={`badge${b.enabled ? ' ok' : ' warn'}`}>
                      {b.enabled ? 'on' : 'off'}
                    </span>
                  </td>
                </tr>
              ))}
            />
          </section>

          <section>
            <PageHeader title="Recent sync" />
            <DataTable
              columns={['Entity', 'Status', 'Message', 'When']}
              emptyTitle="No sync events"
              rows={overview.recentSync.map((s) => (
                <tr key={s.id}>
                  <td className="mono">
                    {s.entityType}/{s.entityId.slice(0, 8)}
                  </td>
                  <td>
                    <span className="badge">{s.status}</span>
                  </td>
                  <td className="muted">{s.message ?? '—'}</td>
                  <td className="mono faint">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            />
          </section>

          <section>
            <PageHeader title="Audit log" />
            <DataTable
              columns={['Action', 'Actor', 'Entity', 'When']}
              emptyTitle="No audit events"
              rows={audit.map((a) => (
                <tr key={a.id}>
                  <td className="mono">{a.action}</td>
                  <td>{a.actorEmail ?? '—'}</td>
                  <td className="mono faint">
                    {a.entityType
                      ? `${a.entityType}/${a.entityId?.slice(0, 8) ?? ''}`
                      : '—'}
                  </td>
                  <td className="mono faint">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            />
          </section>
        </div>
      ) : (
        <p style={{ color: 'var(--danger)' }}>
          Ops overview unavailable — is the API running?
        </p>
      )}
    </PortalShell>
  );
}
