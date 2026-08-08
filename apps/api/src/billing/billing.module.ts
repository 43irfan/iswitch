import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AccountsModule } from '../tenancy/accounts.module';
import { JobsModule } from '../jobs/jobs.module';
import { CDR_QUEUE } from '../jobs/jobs.constants';
import { BillingController } from './billing.controller';
import { CdrService, RatingService } from './billing.service';
import { CdrProcessor } from './cdr.processor';

@Module({
  imports: [
    AccountsModule,
    JobsModule,
    BullModule.registerQueue({ name: CDR_QUEUE }),
  ],
  controllers: [BillingController],
  providers: [RatingService, CdrService, CdrProcessor],
  exports: [CdrService, RatingService],
})
export class BillingModule {}
