import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SYNC_QUEUE } from './jobs.constants';
import type { SyncJobPayload } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { AsteriskService } from '../asterisk/asterisk.service';

@Processor(SYNC_QUEUE)
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly asterisk: AsteriskService,
  ) {
    super();
  }

  async process(job: Job<SyncJobPayload>) {
    const { entityType, entityId, action } = job.data;
    this.logger.log(
      `Asterisk sync job=${job.id} ${action} ${entityType}/${entityId}`,
    );

    // Phase 3: queue + audit only. Real ARI/Realtime apply comes when Asterisk is wired.
    const status = this.asterisk.getConfigStatus();
    const message = status.connected
      ? 'Applied to Asterisk'
      : 'Queued locally — Asterisk not connected (stub sync OK)';

    await this.prisma.syncAudit.create({
      data: {
        entityType,
        entityId,
        action,
        status: status.connected ? 'synced' : 'stubbed',
        message,
        payload: job.data as object,
      },
    });

    if (entityType === 'extension' && entityId !== 'probe' && action !== 'delete') {
      await this.prisma.extension.updateMany({
        where: { id: entityId },
        data: {
          syncStatus: status.connected ? 'SYNCED' : 'PENDING',
          syncError: status.connected ? null : 'Asterisk offline — pending sync',
        },
      });
    }

    if (entityType === 'did' && entityId !== 'probe' && action !== 'delete') {
      await this.prisma.did.updateMany({
        where: { id: entityId },
        data: {
          syncStatus: status.connected ? 'SYNCED' : 'PENDING',
          syncError: status.connected ? null : 'Asterisk offline — pending sync',
        },
      });
    }

    if (
      entityType === 'customer_trunk' &&
      entityId !== 'probe' &&
      action !== 'delete'
    ) {
      await this.prisma.customerTrunk.updateMany({
        where: { id: entityId },
        data: {
          syncStatus: status.connected ? 'SYNCED' : 'PENDING',
          syncError: status.connected ? null : 'Asterisk offline — pending sync',
        },
      });
    }

    if (
      entityType === 'carrier_trunk' &&
      entityId !== 'probe' &&
      action !== 'delete'
    ) {
      await this.prisma.carrierTrunk.updateMany({
        where: { id: entityId },
        data: {
          syncStatus: status.connected ? 'SYNCED' : 'PENDING',
          syncError: status.connected ? null : 'Asterisk offline — pending sync',
        },
      });
    }

    return { ok: true, message, processedAt: new Date().toISOString() };
  }
}
