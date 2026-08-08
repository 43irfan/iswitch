import { Module } from '@nestjs/common';
import { AccountsModule } from '../tenancy/accounts.module';
import { JobsModule } from '../jobs/jobs.module';
import { WholesaleController } from './wholesale.controller';
import {
  CarrierTrunksService,
  CustomerTrunksService,
  RoutesService,
  WholesaleAccessService,
  WholesaleBillingService,
} from './wholesale.service';

@Module({
  imports: [AccountsModule, JobsModule],
  controllers: [WholesaleController],
  providers: [
    WholesaleAccessService,
    CustomerTrunksService,
    CarrierTrunksService,
    RoutesService,
    WholesaleBillingService,
  ],
})
export class WholesaleModule {}
