import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { SyncProcessor } from './sync.processor';
import { CDR_QUEUE, SYNC_QUEUE } from './jobs.constants';
import { AsteriskModule } from '../asterisk/asterisk.module';

@Module({
  imports: [
    AsteriskModule,
    BullModule.registerQueue({ name: SYNC_QUEUE }),
    BullModule.registerQueue({ name: CDR_QUEUE }),
  ],
  controllers: [JobsController],
  providers: [JobsService, SyncProcessor],
  exports: [JobsService],
})
export class JobsModule {}
