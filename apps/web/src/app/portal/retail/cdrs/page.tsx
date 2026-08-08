import { CdrsPage } from '@/components/cdrs-page';
import { UserRole } from '@iswitch/shared';

export default function RetailCdrsPage() {
  return <CdrsPage role={UserRole.RETAIL_CUSTOMER_ADMIN} title="CDRs" />;
}
