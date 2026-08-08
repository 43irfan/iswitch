import { RoutesView } from '@/components/routes-view';
import { UserRole } from '@iswitch/shared';

export default async function AdminRoutesPage() {
  return <RoutesView role={UserRole.SUPER_ADMIN} title="Routes" />;
}
