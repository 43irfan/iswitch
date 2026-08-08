import { Module } from '@nestjs/common';
import { AccountsModule } from '../tenancy/accounts.module';
import { JobsModule } from '../jobs/jobs.module';
import { RetailController } from './retail.controller';
import { ExtensionsService, RetailAccessService } from './extensions.service';
import { DidsService } from './dids.service';
import {
  IvrService,
  QueuesService,
  RingGroupsService,
} from './groups-queues-ivr.service';

@Module({
  imports: [AccountsModule, JobsModule],
  controllers: [RetailController],
  providers: [
    RetailAccessService,
    ExtensionsService,
    DidsService,
    RingGroupsService,
    QueuesService,
    IvrService,
  ],
})
export class RetailModule {}
