import { PortalShell } from '@/components/portal-shell';
import { apiFetch, serverCookieHeader } from '@/lib/api';
import { getPortalShell, requireUser } from '@/lib/session';
import { UserRole } from '@iswitch/shared';

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
      <h2 className="text-xl font-semibold">Self-care</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Your assigned extension credentials for softphone / desk phone.
      </p>
      {mine ? (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm">
          <p>
            <span className="text-zinc-500">Extension</span>{' '}
            <span className="font-medium">{mine.number}</span>
            {mine.displayName ? ` — ${mine.displayName}` : ''}
          </p>
          <p className="mt-2">
            <span className="text-zinc-500">SIP username</span>{' '}
            <code className="text-emerald-400">{mine.sipUsername}</code>
          </p>
          <p className="mt-2">
            <span className="text-zinc-500">SIP password</span>{' '}
            <code className="text-emerald-400">{mine.sipPassword}</code>
          </p>
          <p className="mt-2 text-zinc-400">
            Caller ID: {mine.callerId ?? '—'} · DND: {mine.dnd ? 'on' : 'off'} ·
            Forward: {mine.forwardTo ?? '—'} · Voicemail:{' '}
            {mine.voicemailEnabled ? 'on' : 'off'}
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-amber-400">
          No extension is linked to your user yet.
        </p>
      )}
    </PortalShell>
  );
}
