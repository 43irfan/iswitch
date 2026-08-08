import { APP_NAME, ROLE_PORTAL_PATH } from '@iswitch/shared';
import { LoginForm } from '@/components/login-form';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_PORTAL_PATH[user.role]);

  return (
    <main className="atmosphere min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14">
          <div className="fade-up">
            <p className="brand-mark text-[clamp(2.8rem,8vw,5.5rem)] text-[var(--ink)]">
              {APP_NAME}
            </p>
            <div className="mt-4 signal-line" />
            <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg">
              Sign in to route, rate, and operate retail and wholesale traffic
              from a single source of truth.
            </p>
          </div>
        </section>

        <section className="flex items-center px-6 py-10 sm:px-10 lg:pr-14">
          <div className="panel w-full max-w-md p-6 sm:p-8 fade-up-delay">
            <p className="page-kicker">Secure access</p>
            <h1 className="page-title mt-2">Sign in</h1>
            <p className="page-lede">
              Session cookie auth with role-scoped portals.
            </p>
            <LoginForm />
            <div className="mt-8 border-t border-[var(--line)] pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                Demo accounts
              </p>
              <ul className="mt-3 space-y-1.5 font-mono text-xs text-[var(--ink-soft)]">
                <li>admin@iswitch.local</li>
                <li>reseller@iswitch.local</li>
                <li>retail@iswitch.local</li>
                <li>wholesale@iswitch.local</li>
                <li>user@iswitch.local</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
