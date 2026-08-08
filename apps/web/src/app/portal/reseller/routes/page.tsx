import { RoutesView } from '@/components/routes-view';
import { UserRole } from '@iswitch/shared';

export default async function ResellerRoutesPage() {
  return <RoutesView role={UserRole.RESELLER} title="Routes" />;
}
