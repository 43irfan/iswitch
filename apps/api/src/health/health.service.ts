import { Injectable } from '@nestjs/common';
import type { HealthResponse } from '@iswitch/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<
    HealthResponse & { database: string; redisQueue: string }
  > {
    let database = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'error';
    }

    return {
      status: 'ok',
      service: 'iswitch-api',
      timestamp: new Date().toISOString(),
      database,
      redisQueue: 'configured',
    };
  }
}
