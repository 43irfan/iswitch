import { CdrsPage } from '@/components/cdrs-page';
import { UserRole } from '@iswitch/shared';

export default function AdminCdrsPage() {
  return <CdrsPage role={UserRole.SUPER_ADMIN} title="CDRs" />;
}
