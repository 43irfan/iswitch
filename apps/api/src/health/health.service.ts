import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { HealthResponse } from '@iswitch/shared';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  private redis: Redis | null = null;

  constructor(
    private readonly prisma: PrismaService,
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

  async check(): Promise<
    HealthResponse & {
      database: string;
      redis: string;
      phase: number;
    }
  > {
    let database = 'ok';
    let redis = 'ok';

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
    } catch {
      redis = 'error';
    }

    const healthy = database === 'ok' && redis === 'ok';
    return {
      status: healthy ? 'ok' : 'degraded',
      service: 'iswitch-api',
      timestamp: new Date().toISOString(),
      database,
      redis,
      phase: 6,
    };
  }

  async live() {
    return { status: 'ok', service: 'iswitch-api' };
  }
}
