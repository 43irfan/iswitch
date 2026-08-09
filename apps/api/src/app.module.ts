import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AsteriskModule } from './asterisk/asterisk.module';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './tenancy/accounts.module';
import { PortalModule } from './portal/portal.module';
import { RetailModule } from './retail/retail.module';
import { WholesaleModule } from './wholesale/wholesale.module';
import { BillingModule } from './billing/billing.module';
import { OpsModule } from './ops/ops.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Support both package-local execution and monorepo-root configuration.
      // The package-local file wins when both exist.
      envFilePath: [
        resolve(__dirname, '../.env'),
        resolve(__dirname, '../../../.env'),
      ],
      validate: (env: Record<string, unknown>) => {
        const token = env.CDR_INGEST_TOKEN;
        if (
          env.NODE_ENV === 'production' &&
          (typeof token !== 'string' ||
            token.length < 32 ||
            token === 'dev-cdr-token')
        ) {
          throw new Error(
            'CDR_INGEST_TOKEN must be a unique secret of at least 32 characters in production',
          );
        }
        return env;
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 120,
      },
    ]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    PrismaModule,
    OpsModule,
    AuthModule,
    AccountsModule,
    PortalModule,
    RetailModule,
    WholesaleModule,
    BillingModule,
    HealthModule,
    AsteriskModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
