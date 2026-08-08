import { CdrsPage } from '@/components/cdrs-page';
import { UserRole } from '@iswitch/shared';

export default function WholesaleCdrsPage() {
  return <CdrsPage role={UserRole.WHOLESALE_CUSTOMER} title="CDRs" />;
}
