import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { canPlaceCall } from '@iswitch/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FraudService {
  constructor(private readonly prisma: PrismaService) {}

  async listBlocks(accountId?: string | null) {
    return this.prisma.destinationBlock.findMany({
      where: accountId
        ? { OR: [{ accountId }, { accountId: '' }] }
        : undefined,
      orderBy: [{ prefix: 'asc' }],
    });
  }

  async createBlock(input: {
    accountId?: string | null;
    prefix: string;
    reason?: string;
  }) {
    const prefix = input.prefix.replace(/\D/g, '');
    if (!prefix) throw new BadRequestException('prefix required');
    return this.prisma.destinationBlock.create({
      data: {
        accountId: input.accountId ?? '',
        prefix,
        reason: input.reason,
      },
    });
  }

  async removeBlock(id: string) {
    const existing = await this.prisma.destinationBlock.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Block not found');
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
  async checkCall(input: {
    accountId: string;
    destination: string;
    activeChannels?: number;
  }) {
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
