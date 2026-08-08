'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { APP_NAME, ROLE_LABEL, type SessionUser } from '@iswitch/shared';
import { ThemeSwitch } from '@/components/theme-provider';

type NavItem = { href: string; label: string };

const ROOT_HREFS = new Set([
  '/portal/admin',
  '/portal/reseller',
  '/portal/retail',
  '/portal/wholesale',
  '/portal/end-user',
]);

/** IXC-style operator sections */
function groupFor(item: NavItem): string {
  const { href, label } = item;
  if (label === 'Dashboard' || ROOT_HREFS.has(href)) return 'Management';
  if (
    href.includes('/extensions') ||
    href.includes('/dids') ||
    href.includes('/ring-groups') ||
    href.includes('/queues') ||
    href.includes('/ivr') ||
    href.includes('/trunks') ||
    href.includes('/calls') ||
    href.includes('/resellers') ||
    href.includes('/customers')
  ) {
    return 'Management';
  }
  if (href.includes('/carriers') || href.includes('/routes')) return 'Routing';
  if (href.includes('/cdrs') || href.includes('/billing')) return 'Finance';
  if (href.includes('/system')) return 'System';
  return 'Management';
}

const GROUP_ORDER = ['Management', 'Routing', 'Finance', 'System'];

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
  const role = roleLabel || ROLE_LABEL[user.role];

  const grouped = GROUP_ORDER.map((name) => ({
    name,
    items: nav.filter((item) => groupFor(item) === name),
  })).filter((g) => g.items.length > 0);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link href="/portal" className="sidebar-brand">
          {APP_NAME}
          <span className="tag">NOC</span>
        </Link>

        <nav className="nav-body" aria-label="Portal">
          {grouped.map((group) => (
            <div key={group.name} className="nav-group">
              <div className="nav-group-label">{group.name}</div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${navActive(item.href, pathname) ? ' active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-block">
            <div className="user-avatar">
              {(user.name ?? user.email).slice(0, 1).toUpperCase()}
            </div>
            <div className="user-meta">
              <strong>{user.name ?? user.email}</strong>
              <span>
                {role} · {user.account.name}
              </span>
            </div>
          </div>
          <button type="button" className="btn-signout" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <h1>{title}</h1>
          <div className="topbar-right">
            <div className="live-pill">
              <span className="live-dot" aria-hidden />
              Softswitch live
            </div>
            <ThemeSwitch />
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
