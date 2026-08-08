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

    try {
      // Phase 3–6: queue + audit. Real ARI/Realtime apply when Asterisk is wired.
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

      await this.markEntitySync(
        entityType,
        entityId,
        action,
        status.connected ? 'SYNCED' : 'PENDING',
        status.connected ? null : 'Asterisk offline — pending sync',
      );

      return { ok: true, message, processedAt: new Date().toISOString() };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      this.logger.error(`Sync failed job=${job.id}: ${message}`);

      await this.prisma.syncAudit.create({
        data: {
          entityType,
          entityId,
          action,
          status: 'error',
          message,
          payload: job.data as object,
        },
      });

      await this.markEntitySync(
        entityType,
        entityId,
        action,
        'ERROR',
        message,
      );

      throw err;
    }
  }

  private async markEntitySync(
    entityType: string,
    entityId: string,
    action: string,
    syncStatus: 'SYNCED' | 'PENDING' | 'ERROR',
    syncError: string | null,
  ) {
    if (entityId === 'probe' || action === 'delete') return;

    const data = { syncStatus, syncError };

    if (entityType === 'extension') {
      await this.prisma.extension.updateMany({ where: { id: entityId }, data });
    } else if (entityType === 'did') {
      await this.prisma.did.updateMany({ where: { id: entityId }, data });
    } else if (entityType === 'customer_trunk') {
      await this.prisma.customerTrunk.updateMany({
        where: { id: entityId },
        data,
      });
    } else if (entityType === 'carrier_trunk') {
      await this.prisma.carrierTrunk.updateMany({
        where: { id: entityId },
        data,
      });
    }
  }
}
