import Link from 'next/link';
import { APP_NAME, ROLE_PORTAL_PATH } from '@iswitch/shared';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_PORTAL_PATH[user.role]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
          Phase 3 · Retail PBX
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-400">
          Hosted PBX control plane with extensions, DIDs, and Asterisk sync
          queue. Sign in to your portal.
        </p>
        <div className="mt-10">
          <Link
            href="/login"
            className="inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
