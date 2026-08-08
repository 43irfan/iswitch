import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SYNC_QUEUE } from './jobs.constants';
import { PrismaService } from '../prisma/prisma.service';

export type SyncJobPayload = {
  entityType: string;
  entityId: string;
  action: 'upsert' | 'delete' | 'probe';
  accountId?: string;
  requestedAt: string;
};

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue(SYNC_QUEUE) private readonly syncQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async enqueueSyncProbe(entity: string) {
    return this.enqueueAsteriskSync({
      entityType: entity,
      entityId: 'probe',
      action: 'probe',
    });
  }

  async enqueueAsteriskSync(input: {
    entityType: string;
    entityId: string;
    action: 'upsert' | 'delete' | 'probe';
    accountId?: string;
  }) {
    const payload: SyncJobPayload = {
      ...input,
      requestedAt: new Date().toISOString(),
    };

    await this.prisma.syncAudit.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        status: 'queued',
        payload,
      },
    });

    const job = await this.syncQueue.add('asterisk-sync', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    });

    return { jobId: job.id, queue: SYNC_QUEUE, ...payload };
  }
}
