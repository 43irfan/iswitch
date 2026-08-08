import { PortalShell } from '@/components/portal-shell';
import { CreateTrunkForm } from '@/components/create-trunk-form';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

type Trunk = {
  id: string;
  name: string;
  authType: string;
  sipUsername: string | null;
  sipPassword: string | null;
  ipAcl: string | null;
  techPrefix: string | null;
  maxChannels: number;
  maxCps: number;
  enabled: boolean;
  syncStatus: string;
};

export default async function WholesaleTrunksPage() {
  await requireUser(UserRole.WHOLESALE_CUSTOMER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const trunks = await apiFetch<Trunk[]>('/wholesale/trunks', { cookieHeader });

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="Trunks"
    >
      <PageHeader
        title="Customer SIP trunks"
        description="Auth, IP ACL, tech prefix, capacity — synced when Asterisk is online."
      />
      <CreateTrunkForm />
      <DataTable
        columns={['Name', 'Auth', 'SIP', 'Capacity', 'Sync']}
        emptyTitle="No trunks"
        rows={trunks.map((t) => (
          <tr key={t.id}>
            <td style={{ fontWeight: 520 }}>
              {t.name}
              {!t.enabled ? ' (disabled)' : ''}
            </td>
            <td className="mono">{t.authType}</td>
            <td className="mono">
              {t.sipUsername ?? '—'}
              {t.sipPassword ? (
                <div className="faint">{t.sipPassword}</div>
              ) : null}
              {t.ipAcl ? <div className="faint">ACL {t.ipAcl}</div> : null}
            </td>
            <td className="mono">
              {t.maxChannels} ch / {t.maxCps} cps
              {t.techPrefix ? ` · ${t.techPrefix}` : ''}
            </td>
            <td>
              <span className="badge">{t.syncStatus}</span>
            </td>
          </tr>
        ))}
      />
    </PortalShell>
  );
}
