import { CarriersView } from '@/components/carriers-view';
import { UserRole } from '@iswitch/shared';

export default async function AdminCarriersPage() {
  return <CarriersView role={UserRole.SUPER_ADMIN} title="Carriers" />;
}
