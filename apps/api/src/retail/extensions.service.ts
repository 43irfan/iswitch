import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { SessionUser } from '@iswitch/shared';
import { UserRole } from '@iswitch/shared';
import { PrismaService } from '../prisma/prisma.service';
import { TenancyService } from '../tenancy/tenancy.service';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class RetailAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancy: TenancyService,
  ) {}

  /** Retail account id the actor manages (own account for retail admin). */
  async resolveRetailAccountId(
    user: SessionUser,
    accountId?: string,
  ): Promise<string> {
    if (user.role === UserRole.RETAIL_CUSTOMER_ADMIN) {
      if (user.account.type !== 'RETAIL') {
        throw new ForbiddenException('Not a retail account');
      }
      return user.accountId;
    }

    if (
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.RESELLER
    ) {
      const target = accountId ?? user.accountId;
      await this.tenancy.assertCanAccessAccount(user, target);
      const account = await this.prisma.account.findUnique({
        where: { id: target },
      });
      if (!account || account.type !== 'RETAIL') {
        throw new BadRequestException('Target must be a RETAIL account');
      }
      return target;
    }

    throw new ForbiddenException('Retail PBX access denied');
  }
}

@Injectable()
export class ExtensionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: RetailAccessService,
    private readonly jobs: JobsService,
  ) {}

  async list(user: SessionUser, accountId?: string) {
    if (user.role === UserRole.END_USER) {
      return this.prisma.extension.findMany({
        where: { userId: user.id },
        orderBy: { number: 'asc' },
      });
    }
    const retailId = await this.access.resolveRetailAccountId(user, accountId);
    return this.prisma.extension.findMany({
      where: { accountId: retailId },
      orderBy: { number: 'asc' },
      include: { voicemailBox: true, user: { select: { id: true, email: true, name: true } } },
    });
  }

  async create(
    user: SessionUser,
    input: {
      number: string;
      displayName?: string;
      sipPassword?: string;
      callerId?: string;
      dnd?: boolean;
      forwardTo?: string | null;
      voicemailEnabled?: boolean;
      userId?: string | null;
    },
    accountId?: string,
  ) {
    const retailId = await this.access.resolveRetailAccountId(user, accountId);
    const sipPassword = input.sipPassword ?? randomBytes(6).toString('hex');
    const sipUsername = `${input.number}`;

    const extension = await this.prisma.extension.create({
      data: {
        accountId: retailId,
        number: input.number,
        displayName: input.displayName,
        sipUsername,
        sipPassword,
        callerId: input.callerId,
        dnd: input.dnd ?? false,
        forwardTo: input.forwardTo ?? null,
        voicemailEnabled: input.voicemailEnabled ?? true,
        userId: input.userId ?? null,
        syncStatus: 'PENDING',
        voicemailBox: input.voicemailEnabled === false
          ? undefined
          : {
              create: {
                accountId: retailId,
                mailbox: input.number,
                email: user.email,
                pin: '0000',
              },
            },
      },
      include: { voicemailBox: true },
    });

    await this.jobs.enqueueAsteriskSync({
      entityType: 'extension',
      entityId: extension.id,
      action: 'upsert',
      accountId: retailId,
    });

    return extension;
  }

  async update(
    user: SessionUser,
    id: string,
    input: Partial<{
      number: string;
      displayName: string;
      sipPassword: string;
      callerId: string;
      dnd: boolean;
      forwardTo: string | null;
      voicemailEnabled: boolean;
      userId: string | null;
    }>,
  ) {
    const existing = await this.prisma.extension.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Extension not found');
    await this.access.resolveRetailAccountId(user, existing.accountId);

    const extension = await this.prisma.extension.update({
      where: { id },
      data: {
        ...input,
        sipUsername: input.number ?? existing.sipUsername,
        syncStatus: 'PENDING',
      },
    });

    await this.jobs.enqueueAsteriskSync({
      entityType: 'extension',
      entityId: extension.id,
      action: 'upsert',
      accountId: extension.accountId,
    });

    return extension;
  }

  async remove(user: SessionUser, id: string) {
    const existing = await this.prisma.extension.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Extension not found');
    await this.access.resolveRetailAccountId(user, existing.accountId);

    await this.prisma.extension.delete({ where: { id } });
    await this.jobs.enqueueAsteriskSync({
      entityType: 'extension',
      entityId: id,
      action: 'delete',
      accountId: existing.accountId,
    });
    return { ok: true };
  }
}
