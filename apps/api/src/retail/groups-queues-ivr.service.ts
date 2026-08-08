import { Injectable, NotFoundException } from '@nestjs/common';
import type { SessionUser } from '@iswitch/shared';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { RetailAccessService } from './extensions.service';

@Injectable()
export class RingGroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: RetailAccessService,
    private readonly jobs: JobsService,
  ) {}

  async list(user: SessionUser, accountId?: string) {
    const retailId = await this.access.resolveRetailAccountId(user, accountId);
    return this.prisma.ringGroup.findMany({
      where: { accountId: retailId },
      include: {
        members: {
          include: {
            extension: { select: { id: true, number: true, displayName: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(
    user: SessionUser,
    input: {
      name: string;
      strategy?: 'RINGALL' | 'LEASTRECENT' | 'FEWESTCALLS' | 'RANDOM' | 'RRMEMORY';
      ringTimeout?: number;
      extensionIds: string[];
    },
    accountId?: string,
  ) {
    const retailId = await this.access.resolveRetailAccountId(user, accountId);
    const group = await this.prisma.ringGroup.create({
      data: {
        accountId: retailId,
        name: input.name,
        strategy: input.strategy ?? 'RINGALL',
        ringTimeout: input.ringTimeout ?? 20,
        members: {
          create: input.extensionIds.map((extensionId, i) => ({
            extensionId,
            priority: i + 1,
          })),
        },
      },
      include: { members: true },
    });

    await this.jobs.enqueueAsteriskSync({
      entityType: 'ring_group',
      entityId: group.id,
      action: 'upsert',
      accountId: retailId,
    });

    return group;
  }

  async remove(user: SessionUser, id: string) {
    const existing = await this.prisma.ringGroup.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ring group not found');
    await this.access.resolveRetailAccountId(user, existing.accountId);
    await this.prisma.ringGroup.delete({ where: { id } });
    await this.jobs.enqueueAsteriskSync({
      entityType: 'ring_group',
      entityId: id,
      action: 'delete',
      accountId: existing.accountId,
    });
    return { ok: true };
  }
}

@Injectable()
export class QueuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: RetailAccessService,
    private readonly jobs: JobsService,
  ) {}

  async list(user: SessionUser, accountId?: string) {
    const retailId = await this.access.resolveRetailAccountId(user, accountId);
    return this.prisma.callQueue.findMany({
      where: { accountId: retailId },
      include: {
        members: {
          include: {
            extension: { select: { id: true, number: true, displayName: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(
    user: SessionUser,
    input: {
      name: string;
      extension?: string;
      strategy?: 'RINGALL' | 'LEASTRECENT' | 'FEWESTCALLS' | 'RANDOM' | 'RRMEMORY';
      timeout?: number;
      musicOnHold?: string;
      extensionIds: string[];
    },
    accountId?: string,
  ) {
    const retailId = await this.access.resolveRetailAccountId(user, accountId);
    const queue = await this.prisma.callQueue.create({
      data: {
        accountId: retailId,
        name: input.name,
        extension: input.extension,
        strategy: input.strategy ?? 'RINGALL',
        timeout: input.timeout ?? 30,
        musicOnHold: input.musicOnHold ?? 'default',
        members: {
          create: input.extensionIds.map((extensionId) => ({ extensionId })),
        },
      },
      include: { members: true },
    });

    await this.jobs.enqueueAsteriskSync({
      entityType: 'queue',
      entityId: queue.id,
      action: 'upsert',
      accountId: retailId,
    });

    return queue;
  }

  async remove(user: SessionUser, id: string) {
    const existing = await this.prisma.callQueue.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Queue not found');
    await this.access.resolveRetailAccountId(user, existing.accountId);
    await this.prisma.callQueue.delete({ where: { id } });
    await this.jobs.enqueueAsteriskSync({
      entityType: 'queue',
      entityId: id,
      action: 'delete',
      accountId: existing.accountId,
    });
    return { ok: true };
  }
}

@Injectable()
export class IvrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: RetailAccessService,
    private readonly jobs: JobsService,
  ) {}

  async list(user: SessionUser, accountId?: string) {
    const retailId = await this.access.resolveRetailAccountId(user, accountId);
    return this.prisma.ivrMenu.findMany({
      where: { accountId: retailId },
      orderBy: { name: 'asc' },
    });
  }

  async create(
    user: SessionUser,
    input: {
      name: string;
      greetingPrompt?: string;
      timeoutSeconds?: number;
      options: Record<string, { type: string; ref: string }>;
    },
    accountId?: string,
  ) {
    const retailId = await this.access.resolveRetailAccountId(user, accountId);
    const menu = await this.prisma.ivrMenu.create({
      data: {
        accountId: retailId,
        name: input.name,
        greetingPrompt: input.greetingPrompt ?? 'welcome',
        timeoutSeconds: input.timeoutSeconds ?? 5,
        options: input.options,
      },
    });

    await this.jobs.enqueueAsteriskSync({
      entityType: 'ivr',
      entityId: menu.id,
      action: 'upsert',
      accountId: retailId,
    });

    return menu;
  }

  async remove(user: SessionUser, id: string) {
    const existing = await this.prisma.ivrMenu.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('IVR not found');
    await this.access.resolveRetailAccountId(user, existing.accountId);
    await this.prisma.ivrMenu.delete({ where: { id } });
    await this.jobs.enqueueAsteriskSync({
      entityType: 'ivr',
      entityId: id,
      action: 'delete',
      accountId: existing.accountId,
    });
    return { ok: true };
  }
}
