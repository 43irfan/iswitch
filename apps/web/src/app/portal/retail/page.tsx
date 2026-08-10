import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { NocGrid, NocWidget } from '@/components/ui/noc-widgets';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';
import { SignalCommand } from '@/components/ui/signal-command';

export default async function RetailPortalPage() {
  await requireUser(UserRole.RETAIL_CUSTOMER_ADMIN);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const [account, extensions, dids, ringGroups, queues, ivr, summary] =
    await Promise.all([
      apiFetch<{ name: string; status: string }>('/accounts/me', {
        cookieHeader,
      }),
      apiFetch<unknown[]>('/retail/extensions', { cookieHeader }),
      apiFetch<unknown[]>('/retail/dids', { cookieHeader }),
      apiFetch<unknown[]>('/retail/ring-groups', { cookieHeader }),
      apiFetch<unknown[]>('/retail/queues', { cookieHeader }),
      apiFetch<unknown[]>('/retail/ivr', { cookieHeader }),
      apiFetch<{ count: number }>('/billing/summary', { cookieHeader }).catch(
        () => ({ count: 0 }),
      ),
    ]);

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="NOC dashboard"
    >
      <PageHeader
        title={account.name}
        description={`Retail PBX status · ${account.status}`}
        actions={
          <Link href="/portal/retail/extensions" className="btn btn-primary">
            Extensions
          </Link>
        }
      />
      <SignalCommand
        eyebrow="PBX signal"
        title="Your voice workspace is ready."
        description="A live overview of people, numbers, call flows, and customer conversations."
        primaryLabel="PBX readiness"
        primaryValue={account.status === 'ACTIVE' ? 'Online' : account.status}
        primaryDetail={account.status === 'ACTIVE' ? 'Voice services operational' : 'Account requires attention'}
        healthy={account.status === 'ACTIVE'}
        metrics={[
          { label: 'EXTENSIONS', value: extensions.length, detail: 'People & devices' },
          { label: 'PHONE NUMBERS', value: dids.length, detail: 'Active DIDs' },
          { label: 'CALL ACTIVITY', value: summary.count, detail: 'CDR records' },
        ]}
        href="/portal/retail/extensions"
        actionLabel="Manage extensions"
      />
      <NocGrid>
        <NocWidget
          label="Extensions"
          value={extensions.length}
          tone="ok"
          span={3}
          href="/portal/retail/extensions"
        />
        <NocWidget
          label="DIDs"
          value={dids.length}
          span={3}
          href="/portal/retail/dids"
        />
        <NocWidget
          label="Queues / IVR"
          value={`${queues.length} / ${ivr.length}`}
          span={3}
          meta={`${ringGroups.length} ring groups`}
        />
        <NocWidget
          label="CDRs"
          value={summary.count}
          span={3}
          href="/portal/retail/cdrs"
          actionLabel="Open"
        />
      </NocGrid>
      <div className="list-links">
        {[
          { href: '/portal/retail/extensions', label: 'Extensions', count: extensions.length },
          { href: '/portal/retail/dids', label: 'DIDs', count: dids.length },
          { href: '/portal/retail/ring-groups', label: 'Ring groups', count: ringGroups.length },
          { href: '/portal/retail/queues', label: 'Queues', count: queues.length },
          { href: '/portal/retail/ivr', label: 'IVR', count: ivr.length },
        ].map((l) => (
          <Link key={l.href} href={l.href}>
            <span>{l.label}</span>
            <span className="count">{l.count}</span>
          </Link>
        ))}
      </div>
    </PortalShell>
  );
}
