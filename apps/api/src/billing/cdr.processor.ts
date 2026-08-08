import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CDR_QUEUE } from '../jobs/jobs.constants';
import { PrismaService } from '../prisma/prisma.service';

@Processor(CDR_QUEUE)
export class CdrProcessor extends WorkerHost {
  private readonly logger = new Logger(CdrProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ cdrId: string; uniqueId: string }>) {
    this.logger.log(
      `CDR job ${job.id} cdrId=${job.data.cdrId} uniqueId=${job.data.uniqueId}`,
    );
    const cdr = await this.prisma.cdr.findUnique({
      where: { id: job.data.cdrId },
    });
    return {
      ok: true,
      status: cdr?.status ?? 'missing',
      chargeMicros: cdr?.chargeMicros?.toString() ?? '0',
      processedAt: new Date().toISOString(),
    };
  }
}
