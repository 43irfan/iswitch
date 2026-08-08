import { PortalShell } from '@/components/portal-shell';
import { PageHeader } from '@/components/ui/page-header';
import { KpiStrip } from '@/components/ui/kpi-strip';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';
import { EmptyState } from '@/components/ui/empty-state';

type Extension = {
  id: string;
  number: string;
  displayName: string | null;
  sipUsername: string;
  sipPassword: string;
  callerId: string | null;
  dnd: boolean;
  forwardTo: string | null;
  voicemailEnabled: boolean;
};

export default async function EndUserPortalPage() {
  await requireUser(UserRole.END_USER);
  const shell = await getPortalShell();
  const cookieHeader = await serverCookieHeader();
  const extensions = await apiFetch<Extension[]>('/retail/extensions', {
    cookieHeader,
  });
  const mine = extensions[0];

  return (
    <PortalShell
      user={shell.user}
      roleLabel={shell.roleLabel}
      nav={shell.nav}
      title="My phone"
    >
      <PageHeader
        title="Self-care"
        description="Softphone / desk phone credentials for your extension."
      />
      {mine ? (
        <>
          <KpiStrip
            items={[
              { label: 'Extension', value: mine.number, hero: true },
              { label: 'DND', value: mine.dnd ? 'On' : 'Off' },
              { label: 'Voicemail', value: mine.voicemailEnabled ? 'On' : 'Off' },
              { label: 'Forward', value: mine.forwardTo ?? '—' },
            ]}
          />
          <div className="panel panel-pad">
            <p className="muted" style={{ margin: '0 0 8px', fontSize: 12 }}>
              SIP credentials
            </p>
            <p style={{ margin: '0 0 6px' }}>
              <span className="faint">Username </span>
              <span className="mono">{mine.sipUsername}</span>
            </p>
            <p style={{ margin: 0 }}>
              <span className="faint">Password </span>
              <span className="mono">{mine.sipPassword}</span>
            </p>
            <p className="muted" style={{ margin: '10px 0 0', fontSize: 12 }}>
              Caller ID: {mine.callerId ?? '—'}
              {mine.displayName ? ` · ${mine.displayName}` : ''}
            </p>
          </div>
        </>
      ) : (
        <EmptyState
          title="No extension linked"
          description="Ask your admin to assign an extension to your user."
        />
      )}
    </PortalShell>
  );
}
