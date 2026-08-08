import Link from 'next/link';
import { APP_NAME, ROLE_PORTAL_PATH } from '@iswitch/shared';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_PORTAL_PATH[user.role]);

  return (
    <main className="atmosphere relative min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="fade-up">
          <p className="brand-mark text-[clamp(3.4rem,12vw,7.5rem)] text-[var(--ink)]">
            {APP_NAME}
          </p>
          <div className="mt-5 signal-line" />
        </div>

        <p className="fade-up-delay mt-8 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)] sm:text-xl">
          One control plane for hosted PBX and wholesale SIP — rated, audited,
          and synced to Asterisk.
        </p>

        <div className="fade-up-delay-2 mt-10 flex flex-wrap items-center gap-3">
          <Link href="/login" className="btn-primary">
            Enter portal
          </Link>
          <span className="text-sm text-[var(--ink-faint)]">
            Phase 6 · Hardened ops baseline
          </span>
        </div>
      </div>
    </main>
  );
}
