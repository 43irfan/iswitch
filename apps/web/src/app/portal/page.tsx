import { redirect } from 'next/navigation';
import { ROLE_PORTAL_PATH } from '@iswitch/shared';
import { getSessionUser } from '@/lib/session';

export default async function PortalIndexPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  redirect(ROLE_PORTAL_PATH[user.role]);
}
