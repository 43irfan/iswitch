import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SYNC_QUEUE } from './jobs.constants';

@Injectable()
export class JobsService {
  constructor(@InjectQueue(SYNC_QUEUE) private readonly syncQueue: Queue) {}

  async enqueueSyncProbe(entity: string) {
    const job = await this.syncQueue.add('probe', {
      entity,
      requestedAt: new Date().toISOString(),
    });
    return { jobId: job.id, queue: SYNC_QUEUE, entity };
  }
}
