import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { SessionUser } from '@iswitch/shared';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { RetailAccessService } from './extensions.service';

@Injectable()
export class DidsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: RetailAccessService,
    private readonly jobs: JobsService,
  ) {}

  async list(user: SessionUser, accountId?: string) {
    const retailId = await this.access.resolveRetailAccountId(user, accountId);
    return this.prisma.did.findMany({
      where: { accountId: retailId },
      orderBy: { number: 'asc' },
    });
  }

  async create(
    user: SessionUser,
    input: {
      number: string;
      description?: string;
      destinationType:
        | 'EXTENSION'
        | 'RING_GROUP'
        | 'QUEUE'
        | 'IVR'
        | 'EXTERNAL'
        | 'VOICEMAIL';
      destinationRef: string;
      callerIdName?: string;
      enabled?: boolean;
    },
    accountId?: string,
  ) {
    const retailId = await this.access.resolveRetailAccountId(user, accountId);
    await this.assertDestination(retailId, input.destinationType, input.destinationRef);

    const did = await this.prisma.did.create({
      data: {
        accountId: retailId,
        number: input.number,
        description: input.description,
        destinationType: input.destinationType,
        destinationRef: input.destinationRef,
        callerIdName: input.callerIdName,
        enabled: input.enabled ?? true,
        syncStatus: 'PENDING',
      },
    });

    await this.jobs.enqueueAsteriskSync({
      entityType: 'did',
      entityId: did.id,
      action: 'upsert',
      accountId: retailId,
    });

    return did;
  }

  async update(
    user: SessionUser,
    id: string,
    input: Partial<{
      number: string;
      description: string;
      destinationType:
        | 'EXTENSION'
        | 'RING_GROUP'
        | 'QUEUE'
        | 'IVR'
        | 'EXTERNAL'
        | 'VOICEMAIL';
      destinationRef: string;
      callerIdName: string;
      enabled: boolean;
    }>,
  ) {
    const existing = await this.prisma.did.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('DID not found');
    await this.access.resolveRetailAccountId(user, existing.accountId);

    const destinationType = input.destinationType ?? existing.destinationType;
    const destinationRef = input.destinationRef ?? existing.destinationRef;
    await this.assertDestination(existing.accountId, destinationType, destinationRef);

    const did = await this.prisma.did.update({
      where: { id },
      data: { ...input, syncStatus: 'PENDING' },
    });

    await this.jobs.enqueueAsteriskSync({
      entityType: 'did',
      entityId: did.id,
      action: 'upsert',
      accountId: did.accountId,
    });

    return did;
  }

  async remove(user: SessionUser, id: string) {
    const existing = await this.prisma.did.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('DID not found');
    await this.access.resolveRetailAccountId(user, existing.accountId);
    await this.prisma.did.delete({ where: { id } });
    await this.jobs.enqueueAsteriskSync({
      entityType: 'did',
      entityId: id,
      action: 'delete',
      accountId: existing.accountId,
    });
    return { ok: true };
  }

  private async assertDestination(
    accountId: string,
    type: string,
    ref: string,
  ) {
    if (type === 'EXTERNAL') return;
    if (type === 'EXTENSION') {
      const ext = await this.prisma.extension.findFirst({
        where: { accountId, OR: [{ id: ref }, { number: ref }] },
      });
      if (!ext) throw new BadRequestException('Destination extension not found');
      return;
    }
    if (type === 'RING_GROUP') {
      const rg = await this.prisma.ringGroup.findFirst({
        where: { accountId, OR: [{ id: ref }, { name: ref }] },
      });
      if (!rg) throw new BadRequestException('Destination ring group not found');
      return;
    }
    if (type === 'QUEUE') {
      const q = await this.prisma.callQueue.findFirst({
        where: { accountId, OR: [{ id: ref }, { name: ref }] },
      });
      if (!q) throw new BadRequestException('Destination queue not found');
      return;
    }
    if (type === 'IVR') {
      const ivr = await this.prisma.ivrMenu.findFirst({
        where: { accountId, OR: [{ id: ref }, { name: ref }] },
      });
      if (!ivr) throw new BadRequestException('Destination IVR not found');
      return;
    }
    if (type === 'VOICEMAIL') {
      const vm = await this.prisma.voicemailBox.findFirst({
        where: { accountId, OR: [{ id: ref }, { mailbox: ref }] },
      });
      if (!vm) throw new BadRequestException('Destination voicemail not found');
    }
  }
}
