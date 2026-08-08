import { redirect } from 'next/navigation';
import {
  ROLE_PORTAL_PATH,
  type SessionUser,
  type UserRole,
} from '@iswitch/shared';
import { apiFetch, serverCookieHeader } from '@/lib/api';

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieHeader = await serverCookieHeader();
    if (!cookieHeader) return null;
    const data = await apiFetch<{ user: SessionUser }>('/auth/me', {
      cookieHeader,
    });
    return data.user;
  } catch {
    return null;
  }
}

export async function requireUser(expected?: UserRole | UserRole[]) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  if (expected) {
    const allowed = Array.isArray(expected) ? expected : [expected];
    if (!allowed.includes(user.role)) {
      redirect(ROLE_PORTAL_PATH[user.role]);
    }
  }

  return user;
}

export async function getPortalShell() {
  const cookieHeader = await serverCookieHeader();
  return apiFetch<{
    user: SessionUser;
    portalPath: string;
    roleLabel: string;
    nav: { href: string; label: string }[];
  }>('/portal/shell', { cookieHeader });
}
