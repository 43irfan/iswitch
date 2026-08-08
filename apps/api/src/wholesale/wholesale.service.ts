import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { SessionUser } from '@iswitch/shared';
import { UserRole, canPlaceCall } from '@iswitch/shared';
import { PrismaService } from '../prisma/prisma.service';
import { TenancyService } from '../tenancy/tenancy.service';
import { JobsService } from '../jobs/jobs.service';
import { FraudService } from '../ops/fraud.service';

function toBigInt(value: number | string | bigint | undefined, fallback = 0n) {
  if (value === undefined || value === null) return fallback;
  return BigInt(value);
}

@Injectable()
export class WholesaleAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancy: TenancyService,
  ) {}

  async resolveWholesaleAccountId(
    user: SessionUser,
    accountId?: string,
  ): Promise<string> {
    if (user.role === UserRole.WHOLESALE_CUSTOMER) {
      if (user.account.type !== 'WHOLESALE') {
        throw new ForbiddenException('Not a wholesale account');
      }
      return user.accountId;
    }

    if (
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.RESELLER
    ) {
      const target = accountId;
      if (!target) {
        throw new BadRequestException('accountId required for this role');
      }
      await this.tenancy.assertCanAccessAccount(user, target);
      const account = await this.prisma.account.findUnique({
        where: { id: target },
      });
      if (!account || account.type !== 'WHOLESALE') {
        throw new BadRequestException('Target must be a WHOLESALE account');
      }
      return target;
    }

    throw new ForbiddenException('Wholesale access denied');
  }

  /** Platform/reseller scope for managing carriers & routes. */
  async resolveOperatorAccountId(user: SessionUser): Promise<string> {
    if (user.role === UserRole.SUPER_ADMIN) return user.accountId;
    if (user.role === UserRole.RESELLER) return user.accountId;
    throw new ForbiddenException('Operator access required');
  }
}

@Injectable()
export class CustomerTrunksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: WholesaleAccessService,
    private readonly jobs: JobsService,
  ) {}

  async list(user: SessionUser, accountId?: string) {
    const id = await this.access.resolveWholesaleAccountId(user, accountId);
    return this.prisma.customerTrunk.findMany({
      where: { accountId: id },
      orderBy: { name: 'asc' },
    });
  }

  async create(
    user: SessionUser,
    input: {
      name: string;
      authType?: 'USERPASS' | 'IP_ACL' | 'BOTH';
      sipUsername?: string | null;
      sipPassword?: string | null;
      ipAcl?: string | null;
      techPrefix?: string | null;
      maxChannels?: number;
      maxCps?: number;
      enabled?: boolean;
    },
    accountId?: string,
  ) {
    const id = await this.access.resolveWholesaleAccountId(user, accountId);
    const authType = input.authType ?? 'USERPASS';
    const sipUsername =
      input.sipUsername ??
      (authType === 'IP_ACL' ? null : `trunk_${randomBytes(3).toString('hex')}`);
    const sipPassword =
      input.sipPassword ??
      (authType === 'IP_ACL' ? null : randomBytes(6).toString('hex'));

    if ((authType === 'USERPASS' || authType === 'BOTH') && !sipUsername) {
      throw new BadRequestException('sipUsername required for USERPASS auth');
    }
    if ((authType === 'IP_ACL' || authType === 'BOTH') && !input.ipAcl) {
      throw new BadRequestException('ipAcl required for IP_ACL auth');
    }

    const trunk = await this.prisma.customerTrunk.create({
      data: {
        accountId: id,
        name: input.name,
        authType,
        sipUsername,
        sipPassword,
        ipAcl: input.ipAcl ?? null,
        techPrefix: input.techPrefix ?? null,
        maxChannels: input.maxChannels ?? 10,
        maxCps: input.maxCps ?? 5,
        enabled: input.enabled ?? true,
        syncStatus: 'PENDING',
      },
    });

    await this.jobs.enqueueAsteriskSync({
      entityType: 'customer_trunk',
      entityId: trunk.id,
      action: 'upsert',
      accountId: id,
    });

    return trunk;
  }

  async update(
    user: SessionUser,
    trunkId: string,
    input: Partial<{
      name: string;
      authType: 'USERPASS' | 'IP_ACL' | 'BOTH';
      sipUsername: string | null;
      sipPassword: string | null;
      ipAcl: string | null;
      techPrefix: string | null;
      maxChannels: number;
      maxCps: number;
      enabled: boolean;
    }>,
  ) {
    const existing = await this.prisma.customerTrunk.findUnique({
      where: { id: trunkId },
    });
    if (!existing) throw new NotFoundException('Trunk not found');
    await this.access.resolveWholesaleAccountId(user, existing.accountId);

    const trunk = await this.prisma.customerTrunk.update({
      where: { id: trunkId },
      data: { ...input, syncStatus: 'PENDING' },
    });

    await this.jobs.enqueueAsteriskSync({
      entityType: 'customer_trunk',
      entityId: trunk.id,
      action: 'upsert',
      accountId: trunk.accountId,
    });

    return trunk;
  }

  async remove(user: SessionUser, trunkId: string) {
    const existing = await this.prisma.customerTrunk.findUnique({
      where: { id: trunkId },
    });
    if (!existing) throw new NotFoundException('Trunk not found');
    await this.access.resolveWholesaleAccountId(user, existing.accountId);
    await this.prisma.customerTrunk.delete({ where: { id: trunkId } });
    await this.jobs.enqueueAsteriskSync({
      entityType: 'customer_trunk',
      entityId: trunkId,
      action: 'delete',
      accountId: existing.accountId,
    });
    return { ok: true };
  }
}

@Injectable()
export class CarrierTrunksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: WholesaleAccessService,
    private readonly jobs: JobsService,
  ) {}

  async list(user: SessionUser) {
    const ownerId = await this.access.resolveOperatorAccountId(user);
    const where =
      user.role === UserRole.SUPER_ADMIN
        ? {}
        : { accountId: ownerId };
    return this.prisma.carrierTrunk.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { name: 'asc' }],
    });
  }

  async create(
    user: SessionUser,
    input: {
      name: string;
      host: string;
      port?: number;
      sipUsername?: string | null;
      sipPassword?: string | null;
      codecs?: string;
      maxChannels?: number;
      maxCps?: number;
      priority?: number;
      enabled?: boolean;
    },
  ) {
    const ownerId = await this.access.resolveOperatorAccountId(user);
    const trunk = await this.prisma.carrierTrunk.create({
      data: {
        accountId: ownerId,
        name: input.name,
        host: input.host,
        port: input.port ?? 5060,
        sipUsername: input.sipUsername ?? null,
        sipPassword: input.sipPassword ?? null,
        codecs: input.codecs ?? 'ulaw,alaw',
        maxChannels: input.maxChannels ?? 100,
        maxCps: input.maxCps ?? 50,
        priority: input.priority ?? 100,
        enabled: input.enabled ?? true,
        syncStatus: 'PENDING',
      },
    });

    await this.jobs.enqueueAsteriskSync({
      entityType: 'carrier_trunk',
      entityId: trunk.id,
      action: 'upsert',
      accountId: ownerId,
    });

    return trunk;
  }

  async remove(user: SessionUser, id: string) {
    const existing = await this.prisma.carrierTrunk.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Carrier not found');
    if (user.role === UserRole.RESELLER && existing.accountId !== user.accountId) {
      throw new ForbiddenException('Carrier out of scope');
    }
    if (user.role === UserRole.WHOLESALE_CUSTOMER) {
      throw new ForbiddenException('Not allowed');
    }
    await this.access.resolveOperatorAccountId(user);
    await this.prisma.carrierTrunk.delete({ where: { id } });
    await this.jobs.enqueueAsteriskSync({
      entityType: 'carrier_trunk',
      entityId: id,
      action: 'delete',
      accountId: existing.accountId,
    });
    return { ok: true };
  }
}

@Injectable()
export class RoutesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: WholesaleAccessService,
    private readonly jobs: JobsService,
  ) {}

  async list(user: SessionUser) {
    const ownerId = await this.access.resolveOperatorAccountId(user);
    const where =
      user.role === UserRole.SUPER_ADMIN ? {} : { accountId: ownerId };
    return this.prisma.routePrefix.findMany({
      where,
      include: {
        carrierTrunk: { select: { id: true, name: true, host: true } },
      },
      orderBy: [{ prefix: 'asc' }, { priority: 'asc' }],
    });
  }

  /** Longest-prefix match for dialed number (operator-owned routes). */
  async match(user: SessionUser, destination: string) {
    await this.access.resolveOperatorAccountId(user);
    const cleaned = destination.replace(/\D/g, '');
    const routes = await this.list(user);
    const enabled = routes.filter((r) => r.enabled);
    let best: (typeof enabled)[number] | null = null;
    for (const route of enabled) {
      if (cleaned.startsWith(route.prefix)) {
        if (!best || route.prefix.length > best.prefix.length) {
          best = route;
        } else if (
          best &&
          route.prefix.length === best.prefix.length &&
          route.priority < best.priority
        ) {
          best = route;
        }
      }
    }
    return best;
  }

  async create(
    user: SessionUser,
    input: {
      prefix: string;
      description?: string;
      carrierTrunkId: string;
      rateMicros: number | string;
      costMicros?: number | string;
      priority?: number;
      enabled?: boolean;
    },
  ) {
    const ownerId = await this.access.resolveOperatorAccountId(user);
    const carrier = await this.prisma.carrierTrunk.findUnique({
      where: { id: input.carrierTrunkId },
    });
    if (!carrier) throw new BadRequestException('Carrier trunk not found');
    if (
      user.role === UserRole.RESELLER &&
      carrier.accountId !== user.accountId
    ) {
      throw new ForbiddenException('Carrier out of scope');
    }

    const route = await this.prisma.routePrefix.create({
      data: {
        accountId: user.role === UserRole.SUPER_ADMIN ? carrier.accountId : ownerId,
        prefix: input.prefix,
        description: input.description,
        carrierTrunkId: input.carrierTrunkId,
        rateMicros: toBigInt(input.rateMicros),
        costMicros: toBigInt(input.costMicros, 0n),
        priority: input.priority ?? 100,
        enabled: input.enabled ?? true,
        syncStatus: 'PENDING',
      },
      include: {
        carrierTrunk: { select: { id: true, name: true, host: true } },
      },
    });

    await this.jobs.enqueueAsteriskSync({
      entityType: 'route_prefix',
      entityId: route.id,
      action: 'upsert',
      accountId: route.accountId,
    });

    return this.serializeRoute(route);
  }

  async remove(user: SessionUser, id: string) {
    await this.access.resolveOperatorAccountId(user);
    const existing = await this.prisma.routePrefix.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Route not found');
    if (
      user.role === UserRole.RESELLER &&
      existing.accountId !== user.accountId
    ) {
      throw new ForbiddenException('Route out of scope');
    }
    await this.prisma.routePrefix.delete({ where: { id } });
    await this.jobs.enqueueAsteriskSync({
      entityType: 'route_prefix',
      entityId: id,
      action: 'delete',
      accountId: existing.accountId,
    });
    return { ok: true };
  }

  serializeRoute<T extends { rateMicros: bigint; costMicros: bigint }>(route: T) {
    return {
      ...route,
      rateMicros: route.rateMicros.toString(),
      costMicros: route.costMicros.toString(),
    };
  }
}

@Injectable()
export class WholesaleBillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: WholesaleAccessService,
    private readonly fraud: FraudService,
  ) {}

  async getAccountBilling(user: SessionUser, accountId?: string) {
    const id =
      user.role === UserRole.WHOLESALE_CUSTOMER
        ? user.accountId
        : await this.access.resolveWholesaleAccountId(user, accountId);

    const account = await this.prisma.account.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        billingMode: true,
        balanceMicros: true,
        creditLimitMicros: true,
        maxChannels: true,
        maxCps: true,
        techPrefix: true,
      },
    });

    const credit = canPlaceCall({
      billingMode: account.billingMode,
      balanceMicros: account.balanceMicros,
      creditLimitMicros: account.creditLimitMicros,
      accountStatus: account.status,
    });

    return {
      ...account,
      balanceMicros: account.balanceMicros.toString(),
      creditLimitMicros: account.creditLimitMicros.toString(),
      creditCheck: credit,
    };
  }

  async updateBilling(
    user: SessionUser,
    accountId: string,
    input: {
      balanceMicros?: number | string;
      creditLimitMicros?: number | string;
      billingMode?: 'PREPAID' | 'POSTPAID';
      maxChannels?: number;
      maxCps?: number;
      techPrefix?: string | null;
    },
  ) {
    if (
      user.role !== UserRole.SUPER_ADMIN &&
      user.role !== UserRole.RESELLER
    ) {
      throw new ForbiddenException('Only operators can update billing');
    }
    await this.access.resolveWholesaleAccountId(user, accountId);

    const account = await this.prisma.account.update({
      where: { id: accountId },
      data: {
        ...(input.balanceMicros !== undefined
          ? { balanceMicros: toBigInt(input.balanceMicros) }
          : {}),
        ...(input.creditLimitMicros !== undefined
          ? { creditLimitMicros: toBigInt(input.creditLimitMicros) }
          : {}),
        ...(input.billingMode ? { billingMode: input.billingMode } : {}),
        ...(input.maxChannels !== undefined
          ? { maxChannels: input.maxChannels }
          : {}),
        ...(input.maxCps !== undefined ? { maxCps: input.maxCps } : {}),
        ...(input.techPrefix !== undefined
          ? { techPrefix: input.techPrefix }
          : {}),
      },
      select: {
        id: true,
        name: true,
        status: true,
        billingMode: true,
        balanceMicros: true,
        creditLimitMicros: true,
        maxChannels: true,
        maxCps: true,
        techPrefix: true,
      },
    });

    return {
      ...account,
      balanceMicros: account.balanceMicros.toString(),
      creditLimitMicros: account.creditLimitMicros.toString(),
      creditCheck: canPlaceCall({
        billingMode: account.billingMode,
        balanceMicros: account.balanceMicros,
        creditLimitMicros: account.creditLimitMicros,
        accountStatus: account.status,
      }),
    };
  }

  /** Auth hook for dialplan/ARI — credit + optional destination fraud gate. */
  async creditCheck(
    user: SessionUser,
    accountId?: string,
    destination?: string,
  ) {
    const billing = await this.getAccountBilling(user, accountId);
    if (!destination) return billing;

    const gate = await this.fraud.checkCall({
      accountId: billing.id,
      destination,
    });
    return {
      ...billing,
      callCheck: gate,
      creditCheck: gate.allowed
        ? billing.creditCheck
        : { allowed: false, reason: gate.reason },
    };
  }
}
