import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import type { SessionUser } from '@iswitch/shared';
import { UserRole } from '@iswitch/shared';
import { z } from 'zod';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { FraudService } from './fraud.service';
import { OpsService } from './ops.service';
import { JobsService } from '../jobs/jobs.service';

const blockSchema = z.object({
  prefix: z.string().min(1).max(32),
  reason: z.string().max(200).optional(),
  accountId: z.string().optional().nullable(),
});

const checkSchema = z.object({
  accountId: z.string().min(1),
  destination: z.string().min(1),
  activeChannels: z.number().int().min(0).optional(),
});

@Controller('ops')
export class OpsController {
  constructor(
    private readonly ops: OpsService,
    private readonly audit: AuditService,
    private readonly fraud: FraudService,
    private readonly jobs: JobsService,
  ) {}

  @Public()
  @Get('ready')
  ready() {
    return this.ops.readiness();
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('overview')
  overview() {
    return this.ops.overview();
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('audit')
  auditLog(@Query('take') take?: string) {
    return this.audit.list(take ? Number(take) : 100);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.RESELLER)
  @Get('fraud/blocks')
  listBlocks(@Query('accountId') accountId?: string) {
    return this.fraud.listBlocks(accountId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.RESELLER)
  @Post('fraud/blocks')
  async createBlock(
    @CurrentUser() user: SessionUser,
    @Body() body: unknown,
    @Req() req: Request,
  ) {
    const parsed = blockSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    const block = await this.fraud.createBlock(parsed.data);
    await this.audit.log({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'fraud.block.create',
      entityType: 'DestinationBlock',
      entityId: block.id,
      ip: req.ip,
      meta: parsed.data,
    });
    return block;
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.RESELLER)
  @Delete('fraud/blocks/:id')
  async deleteBlock(
    @CurrentUser() user: SessionUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const result = await this.fraud.removeBlock(id);
    await this.audit.log({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'fraud.block.delete',
      entityType: 'DestinationBlock',
      entityId: id,
      ip: req.ip,
    });
    return result;
  }

  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.RESELLER,
    UserRole.WHOLESALE_CUSTOMER,
    UserRole.RETAIL_CUSTOMER_ADMIN,
  )
  @Post('fraud/check')
  check(@Body() body: unknown) {
    const parsed = checkSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.fraud.checkCall(parsed.data);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post('sync/retry')
  async retrySync(
    @CurrentUser() user: SessionUser,
    @Body() body: { entityType?: string; entityId?: string },
    @Req() req: Request,
  ) {
    if (!body.entityType || !body.entityId) {
      throw new BadRequestException('entityType and entityId required');
    }
    const queued = await this.jobs.enqueueAsteriskSync({
      entityType: body.entityType,
      entityId: body.entityId,
      action: 'upsert',
    });
    await this.audit.log({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'sync.retry',
      entityType: body.entityType,
      entityId: body.entityId,
      ip: req.ip,
    });
    return queued;
  }
}
