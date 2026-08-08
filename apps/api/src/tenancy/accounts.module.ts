import { Module } from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  controllers: [AccountsController],
  providers: [TenancyService, AccountsService],
  exports: [TenancyService, AccountsService],
})
export class AccountsModule {}
