import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { SessionUser } from '@iswitch/shared';
import {
  UserRole,
  billableMinutes,
  chargeMicrosForCall,
  canPlaceCall,
} from '@iswitch/shared';
import { PrismaService } from '../prisma/prisma.service';
import { TenancyService } from '../tenancy/tenancy.service';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Longest-prefix match across enabled platform/reseller routes. */
  async findBestRoute(destination: string, ownerAccountIds?: string[]) {
    const cleaned = destination.replace(/\D/g, '');
    const routes = await this.prisma.routePrefix.findMany({
      where: {
        enabled: true,
        ...(ownerAccountIds?.length
          ? { accountId: { in: ownerAccountIds } }
          : {}),
      },
      include: { carrierTrunk: true },
      orderBy: [{ priority: 'asc' }],
    });

    let best: (typeof routes)[number] | null = null;
    for (const route of routes) {
      if (!cleaned.startsWith(route.prefix)) continue;
      if (
        !best ||
        route.prefix.length > best.prefix.length ||
        (route.prefix.length === best.prefix.length &&
          route.priority < best.priority)
      ) {
        best = route;
      }
    }
    return best;
  }

  async rateAndPersist(input: {
    uniqueId: string;
    accountId: string;
    direction: 'INBOUND' | 'OUTBOUND' | 'INTERNAL';
    caller: string;
    callee: string;
    billsec: number;
    disposition?: string;
    startAt?: string;
    answerAt?: string;
    endAt?: string;
    raw?: Record<string, unknown>;
    customerTrunkId?: string;
  }) {
    const existing = await this.prisma.cdr.findUnique({
      where: { uniqueId: input.uniqueId },
    });
    if (existing) {
      return this.serializeCdr(existing);
    }

    const account = await this.prisma.account.findUnique({
      where: { id: input.accountId },
    });
    if (!account) throw new NotFoundException('Account not found');

    // Collect route owners: platform ancestors + self
    const ownerIds = [account.id];
    if (account.parentId) ownerIds.push(account.parentId);
    const parent = account.parentId
      ? await this.prisma.account.findUnique({ where: { id: account.parentId } })
      : null;
    if (parent?.parentId) ownerIds.push(parent.parentId);

    let rateMicros = account.defaultRateMicros;
    let costMicros = 0n;
    let routePrefixId: string | null = null;
    let carrierTrunkId: string | null = null;

    if (input.direction === 'OUTBOUND' && input.billsec > 0) {
      const route = await this.findBestRoute(input.callee, ownerIds);
      if (route) {
        rateMicros = route.rateMicros;
        costMicros = route.costMicros;
        routePrefixId = route.id;
        carrierTrunkId = route.carrierTrunkId;
      }
    } else if (input.direction !== 'OUTBOUND') {
      rateMicros = 0n;
      costMicros = 0n;
    }

    const charge =
      input.direction === 'OUTBOUND' && input.billsec > 0
        ? chargeMicrosForCall(rateMicros, input.billsec)
        : 0n;

    return this.prisma.$transaction(async (tx) => {
      const cdr = await tx.cdr.create({
        data: {
          uniqueId: input.uniqueId,
          accountId: input.accountId,
          direction: input.direction,
          caller: input.caller,
          callee: input.callee,
          billsec: input.billsec,
          disposition: input.disposition,
          startAt: input.startAt ? new Date(input.startAt) : null,
          answerAt: input.answerAt ? new Date(input.answerAt) : null,
          endAt: input.endAt ? new Date(input.endAt) : null,
          customerTrunkId: input.customerTrunkId,
          carrierTrunkId,
          routePrefixId,
          rateMicros,
          costMicros,
          chargeMicros: charge,
          status: 'RATED',
          ratedAt: new Date(),
          raw: (input.raw as Prisma.InputJsonValue) ?? undefined,
        },
      });

      if (charge > 0n) {
        const locked = await tx.account.findUniqueOrThrow({
          where: { id: input.accountId },
        });

        const credit = canPlaceCall({
          billingMode: locked.billingMode,
          balanceMicros: locked.balanceMicros - charge,
          creditLimitMicros: locked.creditLimitMicros,
          accountStatus: locked.status,
        });

        // Still rate the CDR; for prepaid with insufficient funds mark error but record charge
        const nextBalance = locked.balanceMicros - charge;
        await tx.account.update({
          where: { id: locked.id },
          data: { balanceMicros: nextBalance },
        });

        await tx.balanceLedger.create({
          data: {
            accountId: locked.id,
            cdrId: cdr.id,
            deltaMicros: -charge,
            balanceAfterMicros: nextBalance,
            reason: `CDR ${input.uniqueId} ${billableMinutes(input.billsec)} min`,
          },
        });

        if (!credit.allowed && locked.billingMode === 'PREPAID') {
          await tx.cdr.update({
            where: { id: cdr.id },
            data: {
              errorMessage: 'Rated with insufficient prepaid balance',
            },
          });
        }
      }

      const rated = await tx.cdr.findUniqueOrThrow({ where: { id: cdr.id } });
      return this.serializeCdr(rated);
    });
  }

  serializeCdr(cdr: {
    id: string;
    uniqueId: string;
    accountId: string;
    direction: string;
    caller: string;
    callee: string;
    billsec: number;
    disposition: string | null;
    rateMicros: bigint | null;
    costMicros: bigint | null;
    chargeMicros: bigint;
    status: string;
    ratedAt: Date | null;
    errorMessage: string | null;
    createdAt: Date;
    startAt?: Date | null;
    answerAt?: Date | null;
    endAt?: Date | null;
  }) {
    return {
      ...cdr,
      rateMicros: cdr.rateMicros?.toString() ?? null,
      costMicros: cdr.costMicros?.toString() ?? null,
      chargeMicros: cdr.chargeMicros.toString(),
      billableMinutes: billableMinutes(cdr.billsec),
    };
  }
}

@Injectable()
export class CdrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rating: RatingService,
    private readonly tenancy: TenancyService,
  ) {}

  async ingest(input: {
    uniqueId: string;
    accountId?: string;
    trunkUsername?: string;
    direction: 'INBOUND' | 'OUTBOUND' | 'INTERNAL';
    caller: string;
    callee: string;
    billsec: number;
    disposition?: string;
    startAt?: string;
    answerAt?: string;
    endAt?: string;
    raw?: Record<string, unknown>;
  }) {
    let accountId = input.accountId;
    let customerTrunkId: string | undefined;

    if (!accountId && input.trunkUsername) {
      const trunk = await this.prisma.customerTrunk.findFirst({
        where: { sipUsername: input.trunkUsername },
      });
      if (!trunk) {
        throw new BadRequestException('Unknown trunkUsername');
      }
      accountId = trunk.accountId;
      customerTrunkId = trunk.id;
    }

    if (!accountId) {
      throw new BadRequestException('accountId or trunkUsername required');
    }

    return this.rating.rateAndPersist({
      ...input,
      accountId,
      customerTrunkId,
    });
  }

  async listForUser(user: SessionUser, accountId?: string) {
    let ids: string[];
    if (user.role === UserRole.SUPER_ADMIN) {
      ids = accountId
        ? [accountId]
        : (await this.prisma.account.findMany({ select: { id: true } })).map(
            (a) => a.id,
          );
    } else if (user.role === UserRole.RESELLER) {
      ids = await this.tenancy.getAccessibleAccountIds(user);
      if (accountId) {
        if (!ids.includes(accountId)) {
          throw new BadRequestException('Account out of scope');
        }
        ids = [accountId];
      }
    } else if (
      user.role === UserRole.WHOLESALE_CUSTOMER ||
      user.role === UserRole.RETAIL_CUSTOMER_ADMIN
    ) {
      ids = [user.accountId];
    } else if (user.role === UserRole.END_USER) {
      // End users see CDRs for their linked extension numbers only — simplified: account CDRs filtered later
      ids = [user.accountId];
    } else {
      ids = [user.accountId];
    }

    const rows = await this.prisma.cdr.findMany({
      where: { accountId: { in: ids } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return rows.map((r) => this.rating.serializeCdr(r));
  }

  async summary(user: SessionUser, accountId?: string) {
    const rows = await this.listForUser(user, accountId);
    const totalCharge = rows.reduce(
      (sum, r) => sum + BigInt(r.chargeMicros),
      0n,
    );
    const totalBillsec = rows.reduce((sum, r) => sum + r.billsec, 0);
    return {
      count: rows.length,
      totalBillsec,
      totalChargeMicros: totalCharge.toString(),
      totalChargeUsd: (Number(totalCharge) / 1_000_000).toFixed(4),
    };
  }
}
