import { APP_NAME } from '@iswitch/shared';
import { LoginForm } from '@/components/login-form';
import { getSessionUser } from '@/lib/session';
import { ROLE_PORTAL_PATH } from '@iswitch/shared';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_PORTAL_PATH[user.role]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
          {APP_NAME}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Phase 2 — role-based portals and tenant-scoped access.
        </p>
        <LoginForm />
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-500">
          <p className="font-medium text-zinc-400">Demo accounts</p>
          <ul className="mt-2 space-y-1">
            <li>admin@iswitch.local</li>
            <li>reseller@iswitch.local</li>
            <li>retail@iswitch.local</li>
            <li>wholesale@iswitch.local</li>
            <li>user@iswitch.local</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
