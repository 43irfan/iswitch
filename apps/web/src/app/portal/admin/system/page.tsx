import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/page-header';
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
    action: string;
    status: string;
    message: string | null;
    createdAt: string;
  }[];
  failedSync: {
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
  ip: string | null;
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
        kicker="Operations"
        title="Ops & monitoring"
        description="Health, sync audit, login audit, and destination fraud blocks."
      />

      {overview ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(overview.counts).map(([k, v]) => (
              <div key={k} className="stat">
                <p className="label">{k}</p>
                <p className="value">{v}</p>
              </div>
            ))}
          </div>

          <section className="mt-8">
            <h3 className="page-kicker">Readiness</h3>
            <pre className="panel mt-3 overflow-auto p-4 font-mono text-xs text-[var(--ink-soft)]">
              {JSON.stringify(
                { health, readiness: overview.readiness },
                null,
                2,
              )}
            </pre>
          </section>

          <section className="mt-8">
            <h3 className="page-kicker">Destination blocks</h3>
            <CreateBlockForm />
            <div className="table-wrap mt-4">
              <table>
                <thead>
                  <tr>
                    <th>Prefix</th>
                    <th>Scope</th>
                    <th>Reason</th>
                    <th>Enabled</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((b) => (
                    <tr key={b.id}>
                      <td className="mono font-semibold">{b.prefix}</td>
                      <td className="text-[var(--ink-soft)]">
                        {b.accountId ? b.accountId.slice(0, 8) : 'global'}
                      </td>
                      <td className="text-[var(--ink-soft)]">
                        {b.reason ?? '—'}
                      </td>
                      <td className="text-[var(--ink-soft)]">
                        {b.enabled ? 'yes' : 'no'}
                      </td>
                    </tr>
                  ))}
                  {blocks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-[var(--ink-faint)]"
                      >
                        No blocks yet
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="page-kicker">Recent sync</h3>
            <div className="table-wrap mt-3">
              <table>
                <thead>
                  <tr>
                    <th>Entity</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentSync.map((s) => (
                    <tr key={s.id}>
                      <td className="mono text-xs">
                        {s.entityType}/{s.entityId.slice(0, 8)}
                      </td>
                      <td className="text-[var(--ink-soft)]">{s.status}</td>
                      <td className="text-[var(--ink-soft)]">
                        {s.message ?? '—'}
                      </td>
                      <td className="text-xs text-[var(--ink-faint)]">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="page-kicker">Audit log</h3>
            <div className="table-wrap mt-3">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Entity</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((a) => (
                    <tr key={a.id}>
                      <td className="mono text-xs">{a.action}</td>
                      <td className="text-[var(--ink-soft)]">
                        {a.actorEmail ?? '—'}
                      </td>
                      <td className="text-xs text-[var(--ink-soft)]">
                        {a.entityType
                          ? `${a.entityType}/${a.entityId?.slice(0, 8) ?? ''}`
                          : '—'}
                      </td>
                      <td className="text-xs text-[var(--ink-faint)]">
                        {new Date(a.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <p className="mt-2 text-sm text-[var(--danger)]">
          Could not load ops overview. Is the API running?
        </p>
      )}
    </PortalShell>
  );
}
