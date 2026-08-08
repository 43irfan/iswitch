import { CdrsPage } from '@/components/cdrs-page';
import { UserRole } from '@iswitch/shared';

export default function ResellerCdrsPage() {
  return <CdrsPage role={UserRole.RESELLER} title="CDRs" />;
}
