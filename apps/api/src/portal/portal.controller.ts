import { Controller, Get } from '@nestjs/common';
import type { SessionUser } from '@iswitch/shared';
import { ROLE_LABEL, ROLE_PORTAL_PATH } from '@iswitch/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('portal')
export class PortalController {
  @Get('shell')
  shell(@CurrentUser() user: SessionUser) {
    return {
      user,
      portalPath: ROLE_PORTAL_PATH[user.role],
      roleLabel: ROLE_LABEL[user.role],
      nav: this.navForRole(user.role),
    };
  }

  private navForRole(role: SessionUser['role']) {
    const common = [{ href: ROLE_PORTAL_PATH[role], label: 'Dashboard' }];

    switch (role) {
      case 'SUPER_ADMIN':
        return [
          ...common,
          { href: '/portal/admin/resellers', label: 'Resellers' },
          { href: '/portal/admin/carriers', label: 'Carriers' },
          { href: '/portal/admin/routes', label: 'Routes' },
          { href: '/portal/admin/system', label: 'System' },
        ];
      case 'RESELLER':
        return [
          ...common,
          { href: '/portal/reseller/customers', label: 'Customers' },
          { href: '/portal/reseller/carriers', label: 'Carriers' },
          { href: '/portal/reseller/routes', label: 'Routes' },
        ];
      case 'RETAIL_CUSTOMER_ADMIN':
        return [
          ...common,
          { href: '/portal/retail/extensions', label: 'Extensions' },
          { href: '/portal/retail/dids', label: 'DIDs' },
          { href: '/portal/retail/ring-groups', label: 'Ring groups' },
          { href: '/portal/retail/queues', label: 'Queues' },
          { href: '/portal/retail/ivr', label: 'IVR' },
        ];
      case 'WHOLESALE_CUSTOMER':
        return [
          ...common,
          { href: '/portal/wholesale/trunks', label: 'Trunks' },
          { href: '/portal/wholesale/billing', label: 'Balance' },
        ];
      case 'END_USER':
        return [
          ...common,
          { href: '/portal/end-user/calls', label: 'Call history' },
        ];
      default:
        return common;
    }
  }
}
