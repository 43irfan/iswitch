import { Controller, Get } from '@nestjs/common';
import type { SessionUser } from '@iswitch/shared';
import { UserRole } from '@iswitch/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('me')
  me(@CurrentUser() user: SessionUser) {
    return this.accountsService.getMine(user);
  }

  @Get()
  list(@CurrentUser() user: SessionUser) {
    return this.accountsService.listScoped(user);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.RESELLER)
  @Get('children')
  children(@CurrentUser() user: SessionUser) {
    return this.accountsService.listDirectChildren(user);
  }
}
