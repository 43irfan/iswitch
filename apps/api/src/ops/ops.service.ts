import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { AsteriskService } from '../asterisk/asterisk.service';

@Injectable()
export class OpsService {
  private redis: Redis | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly asterisk: AsteriskService,
    private readonly config: ConfigService,
  ) {}

  private getRedis() {
    if (!this.redis) {
      this.redis = new Redis({
        host: this.config.get('REDIS_HOST') ?? '127.0.0.1',
        port: Number(this.config.get('REDIS_PORT') ?? 6379),
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });
    }
    return this.redis;
  }

  async readiness() {
    let database: 'ok' | 'error' = 'ok';
    let redis: 'ok' | 'error' = 'ok';
    let redisError: string | undefined;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'error';
    }

    try {
      const client = this.getRedis();
      if (client.status !== 'ready') await client.connect();
      const pong = await client.ping();
      if (pong !== 'PONG') redis = 'error';
    } catch (e) {
      redis = 'error';
      redisError = e instanceof Error ? e.message : 'redis error';
    }

    const ready = database === 'ok' && redis === 'ok';
    return {
      status: ready ? 'ready' : 'not_ready',
      database,
      redis,
      redisError,
      asterisk: this.asterisk.getConfigStatus(),
      timestamp: new Date().toISOString(),
    };
  }

  async overview() {
    const [
      accounts,
      users,
      extensions,
      trunks,
      cdrs,
      pendingSync,
      auditCount,
      blocks,
    ] = await Promise.all([
      this.prisma.account.count(),
      this.prisma.user.count(),
      this.prisma.extension.count(),
      this.prisma.customerTrunk.count(),
      this.prisma.cdr.count(),
      this.prisma.syncAudit.count({ where: { status: 'queued' } }),
      this.prisma.auditLog.count(),
      this.prisma.destinationBlock.count({ where: { enabled: true } }),
    ]);

    const recentSync = await this.prisma.syncAudit.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const failedSync = await this.prisma.syncAudit.findMany({
      where: { status: { in: ['error', 'failed'] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      counts: {
        accounts,
        users,
        extensions,
        trunks,
        cdrs,
        pendingSync,
        auditCount,
        destinationBlocks: blocks,
      },
      recentSync,
      failedSync,
      readiness: await this.readiness(),
    };
  }

  async retrySync(entityType: string, entityId: string) {
    const last = await this.prisma.syncAudit.findFirst({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
    return {
      ok: true,
      message: 'Re-queue requested',
      lastStatus: last?.status ?? null,
      entityType,
      entityId,
    };
  }
}
