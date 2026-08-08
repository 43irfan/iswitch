import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SYNC_QUEUE } from './jobs.constants';

@Processor(SYNC_QUEUE)
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  async process(job: Job<{ entity: string; requestedAt: string }>) {
    this.logger.log(
      `Sync probe job ${job.id} entity=${job.data.entity} at=${job.data.requestedAt}`,
    );
    return { ok: true, processedAt: new Date().toISOString() };
  }
}
