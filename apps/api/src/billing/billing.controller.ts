import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SessionUser } from '@iswitch/shared';
import { ingestCdrSchema, UserRole } from '@iswitch/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CdrService } from './billing.service';
import { JobsService } from '../jobs/jobs.service';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly cdrs: CdrService,
    private readonly jobs: JobsService,
    private readonly config: ConfigService,
  ) {}

  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.RESELLER,
    UserRole.WHOLESALE_CUSTOMER,
    UserRole.RETAIL_CUSTOMER_ADMIN,
    UserRole.END_USER,
  )
  @Get('cdrs')
  list(
    @CurrentUser() user: SessionUser,
    @Query('accountId') accountId?: string,
  ) {
    return this.cdrs.listForUser(user, accountId);
  }

  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.RESELLER,
    UserRole.WHOLESALE_CUSTOMER,
    UserRole.RETAIL_CUSTOMER_ADMIN,
  )
  @Get('summary')
  summary(
    @CurrentUser() user: SessionUser,
    @Query('accountId') accountId?: string,
  ) {
    return this.cdrs.summary(user, accountId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.RESELLER)
  @Post('cdrs')
  async ingestAuth(
    @CurrentUser() user: SessionUser,
    @Body() body: unknown,
  ) {
    void user;
    const parsed = ingestCdrSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    const cdr = await this.cdrs.ingest(parsed.data);
    await this.jobs.enqueueCdrRate({ cdrId: cdr.id, uniqueId: cdr.uniqueId });
    return cdr;
  }

  /** Asterisk / mediation can POST with shared token (no user session). */
  @Public()
  @Post('cdrs/ingest')
  async ingestToken(
    @Headers('x-cdr-token') token: string | undefined,
    @Body() body: unknown,
  ) {
    const expected = this.config.get<string>('CDR_INGEST_TOKEN') ?? 'dev-cdr-token';
    if (!token || token !== expected) {
      throw new UnauthorizedException('Invalid CDR ingest token');
    }
    const parsed = ingestCdrSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    const cdr = await this.cdrs.ingest(parsed.data);
    await this.jobs.enqueueCdrRate({ cdrId: cdr.id, uniqueId: cdr.uniqueId });
    return cdr;
  }
}
