import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { canPlaceCall, type SessionUser, UserRole } from '@iswitch/shared';
import { PrismaService } from '../prisma/prisma.service';
import { TenancyService } from '../tenancy/tenancy.service';

@Injectable()
export class FraudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancy: TenancyService,
  ) {}

  async listBlocks(user: SessionUser, accountId?: string | null) {
    if (accountId) {
      await this.tenancy.assertCanAccessAccount(user, accountId);
    }

    const accessibleIds = await this.tenancy.getAccessibleAccountIds(user);
    return this.prisma.destinationBlock.findMany({
      where: accountId
        ? { OR: [{ accountId }, { accountId: '' }] }
        : user.role === UserRole.SUPER_ADMIN
          ? undefined
          : { OR: [{ accountId: { in: accessibleIds } }, { accountId: '' }] },
      orderBy: [{ prefix: 'asc' }],
    });
  }

  async createBlock(
    user: SessionUser,
    input: {
      accountId?: string | null;
      prefix: string;
      reason?: string;
    },
  ) {
    const prefix = input.prefix.replace(/\D/g, '');
    if (!prefix) throw new BadRequestException('prefix required');

    const accountId =
      input.accountId ??
      (user.role === UserRole.SUPER_ADMIN ? '' : user.accountId);
    if (accountId) {
      await this.tenancy.assertCanAccessAccount(user, accountId);
    } else if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can create global blocks');
    }

    return this.prisma.destinationBlock.create({
      data: {
        accountId,
        prefix,
        reason: input.reason,
      },
    });
  }

  async removeBlock(user: SessionUser, id: string) {
    const existing = await this.prisma.destinationBlock.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Block not found');
    if (!existing.accountId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can delete global blocks');
    }
    if (existing.accountId) {
      await this.tenancy.assertCanAccessAccount(user, existing.accountId);
    }
    await this.prisma.destinationBlock.delete({ where: { id } });
    return { ok: true };
  }

  async isDestinationBlocked(accountId: string, destination: string) {
    const cleaned = destination.replace(/\D/g, '');
    const blocks = await this.prisma.destinationBlock.findMany({
      where: {
        enabled: true,
        OR: [{ accountId }, { accountId: '' }],
      },
    });
    const hit = blocks.find((b) => cleaned.startsWith(b.prefix));
    return hit ?? null;
  }

  /**
   * Pre-call gate: account status, credit, destination blocks, soft channel cap.
   */
  async checkCall(
    user: SessionUser,
    input: {
      accountId: string;
      destination: string;
      activeChannels?: number;
    },
  ) {
    await this.tenancy.assertCanAccessAccount(user, input.accountId);
    const account = await this.prisma.account.findUnique({
      where: { id: input.accountId },
    });
    if (!account) {
      return { allowed: false, reason: 'Account not found' };
    }

    const credit = canPlaceCall({
      billingMode: account.billingMode,
      balanceMicros: account.balanceMicros,
      creditLimitMicros: account.creditLimitMicros,
      accountStatus: account.status,
    });
    if (!credit.allowed) {
      return { allowed: false, reason: credit.reason, code: 'CREDIT' };
    }

    const block = await this.isDestinationBlocked(
      account.id,
      input.destination,
    );
    if (block) {
      return {
        allowed: false,
        reason: `Destination blocked (${block.prefix})`,
        code: 'DESTINATION_BLOCK',
        blockId: block.id,
      };
    }

    if (
      account.maxChannels > 0 &&
      (input.activeChannels ?? 0) >= account.maxChannels
    ) {
      return {
        allowed: false,
        reason: 'Max channels exceeded',
        code: 'MAX_CHANNELS',
      };
    }

    return {
      allowed: true,
      maxChannels: account.maxChannels,
      maxCps: account.maxCps,
      billingMode: account.billingMode,
    };
  }
}
