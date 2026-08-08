'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APP_NAME, ROLE_LABEL, type SessionUser } from '@iswitch/shared';

type NavItem = { href: string; label: string };

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

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
              {APP_NAME}
            </p>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="text-zinc-200">{user.name ?? user.email}</p>
              <p className="text-xs text-zinc-500">
                {roleLabel || ROLE_LABEL[user.role]} · {user.account.name}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-zinc-500"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-[200px_1fr]">
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <section>{children}</section>
      </div>
    </div>
  );
}
