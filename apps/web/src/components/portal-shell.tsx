'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { APP_NAME, ROLE_LABEL, type SessionUser } from '@iswitch/shared';

type NavItem = { href: string; label: string };

const ROOT_HREFS = new Set([
  '/portal/admin',
  '/portal/reseller',
  '/portal/retail',
  '/portal/wholesale',
  '/portal/end-user',
]);

function navActive(href: string, pathname: string) {
  if (pathname === href) return true;
  if (ROOT_HREFS.has(href)) return false;
  return pathname.startsWith(`${href}/`) || pathname.startsWith(href);
}

export function PortalShell({
  user,
  roleLabel,
  nav,
  title,
  children,
}: {
  user: SessionUser;
  roleLabel: string;
  nav: NavItem[];
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="atmosphere min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--line)]/80 bg-[rgba(250,252,251,0.78)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="min-w-0 fade-up">
            <div className="flex items-center gap-3">
              <Link
                href="/portal"
                className="brand-mark text-[1.35rem] text-[var(--ink)]"
              >
                {APP_NAME}
              </Link>
              <span className="hidden h-4 w-px bg-[var(--line)] sm:block" />
              <p className="hidden truncate text-sm text-[var(--ink-soft)] sm:block">
                {title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 fade-up-delay">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[var(--ink)]">
                {user.name ?? user.email}
              </p>
              <p className="text-xs text-[var(--ink-faint)]">
                {roleLabel || ROLE_LABEL[user.role]} · {user.account.name}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent-ink)]">
              {(user.name ?? user.email).slice(0, 1).toUpperCase()}
            </div>
            <button type="button" onClick={logout} className="btn-ghost">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[220px_1fr] lg:gap-10">
        <aside className="fade-up">
          <nav className="panel sticky top-24 p-2">
            <p className="page-kicker px-3 pb-2 pt-2">Navigate</p>
            <div className="space-y-0.5">
              {nav.map((item) => {
                const selected = navActive(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-[10px] px-3 py-2.5 text-sm transition-colors ${
                      selected
                        ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent-ink)]'
                        : 'text-[var(--ink-soft)] hover:bg-white/70 hover:text-[var(--ink)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        <main className="portal-content min-w-0 fade-up-delay-2">{children}</main>
      </div>
    </div>
  );
}
