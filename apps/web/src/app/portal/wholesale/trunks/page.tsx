import { PortalShell } from '@/components/portal-shell';
import { CreateTrunkForm } from '@/components/create-trunk-form';
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
      <h2 className="text-xl font-semibold">Customer SIP trunks</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Auth, IP ACL, tech prefix, and capacity limits — synced to Asterisk when
        online.
      </p>
      <CreateTrunkForm />
      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Auth</th>
              <th className="px-4 py-3">SIP user</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Sync</th>
            </tr>
          </thead>
          <tbody>
            {trunks.map((t) => (
              <tr key={t.id} className="border-t border-zinc-800">
                <td className="px-4 py-3 font-medium">
                  {t.name}
                  {!t.enabled ? ' (disabled)' : ''}
                </td>
                <td className="px-4 py-3 text-zinc-400">{t.authType}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {t.sipUsername ?? '—'}
                  {t.sipPassword ? (
                    <span className="block text-zinc-500">{t.sipPassword}</span>
                  ) : null}
                  {t.ipAcl ? (
                    <span className="block text-zinc-500">ACL {t.ipAcl}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {t.maxChannels} ch / {t.maxCps} CPS
                  {t.techPrefix ? ` · prefix ${t.techPrefix}` : ''}
                </td>
                <td className="px-4 py-3 text-zinc-400">{t.syncStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
