import { CarriersView } from '@/components/carriers-view';
import { UserRole } from '@iswitch/shared';

export default async function ResellerCarriersPage() {
  return <CarriersView role={UserRole.RESELLER} title="Carriers" />;
}
