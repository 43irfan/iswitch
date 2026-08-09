'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Activity, BadgeDollarSign, Bell, Building2, ChevronRight, CircleGauge,
  GitBranch, Headphones, LogOut, Menu, Network, PhoneCall, RadioTower,
  Search, ServerCog, Users, X,
} from 'lucide-react';
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

function NavIcon({ item }: { item: NavItem }) {
  const key = `${item.href} ${item.label}`.toLowerCase();
  const Icon = key.includes('dashboard') ? CircleGauge
    : key.includes('extension') ? PhoneCall
    : key.includes('did') ? RadioTower
    : key.includes('carrier') || key.includes('trunk') ? Network
    : key.includes('route') ? GitBranch
    : key.includes('cdr') || key.includes('billing') ? BadgeDollarSign
    : key.includes('system') ? ServerCog
    : key.includes('reseller') || key.includes('customer') ? Building2
    : key.includes('queue') || key.includes('group') || key.includes('ivr') ? Headphones
    : Users;
  return <Icon aria-hidden size={16} strokeWidth={1.8} />;
}

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const role = roleLabel || ROLE_LABEL[user.role];

  const grouped = GROUP_ORDER.map((name) => ({
    name,
    items: nav.filter((item) => groupFor(item) === name),
  })).filter((g) => g.items.length > 0);

  const filteredGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return grouped;
    return grouped
      .map((group) => ({ ...group, items: group.items.filter((item) => item.label.toLowerCase().includes(needle)) }))
      .filter((group) => group.items.length > 0);
  }, [grouped, query]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="app-shell">
      {mobileOpen ? <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /> : null}
      <aside className={`app-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <Link href="/portal" className="sidebar-brand">
          <span className="brand-mark"><Activity size={17} strokeWidth={2.4} /></span>
          <span className="brand-copy">{APP_NAME}<small>Signal OS</small></span>
          <span className="brand-version">v1</span>
        </Link>

        <div className="nav-search">
          <Search size={14} aria-hidden />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a workspace…" aria-label="Find a workspace" />
          <kbd>⌘K</kbd>
        </div>

        <nav className="nav-body" aria-label="Portal">
          {filteredGroups.map((group) => (
            <div key={group.name} className="nav-group">
              <div className="nav-group-label">{group.name}</div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${navActive(item.href, pathname) ? ' active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <NavIcon item={item} />
                  <span>{item.label}</span>
                  {navActive(item.href, pathname) ? <ChevronRight className="nav-chevron" size={14} /> : null}
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
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-title">
            <button className="mobile-menu" type="button" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div><span>Control plane</span><h1>{title}</h1></div>
          </div>
          <div className="topbar-right">
            <div className="live-pill">
              <span className="live-dot" aria-hidden />
              Network live
            </div>
            <button className="icon-button" type="button" aria-label="Notifications"><Bell size={16} /><span className="notification-dot" /></button>
            <ThemeSwitch />
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
