import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { SessionUser } from '@iswitch/shared';
import {
  createDidSchema,
  createExtensionSchema,
  createIvrSchema,
  createQueueSchema,
  createRingGroupSchema,
  updateDidSchema,
  updateExtensionSchema,
  UserRole,
} from '@iswitch/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExtensionsService } from './extensions.service';
import { DidsService } from './dids.service';
import {
  IvrService,
  QueuesService,
  RingGroupsService,
} from './groups-queues-ivr.service';

const RETAIL_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.RESELLER,
  UserRole.RETAIL_CUSTOMER_ADMIN,
] as const;

@Controller('retail')
export class RetailController {
  constructor(
    private readonly extensions: ExtensionsService,
    private readonly dids: DidsService,
    private readonly ringGroups: RingGroupsService,
    private readonly queues: QueuesService,
    private readonly ivr: IvrService,
  ) {}

  // --- Extensions ---
  @Roles(...RETAIL_ROLES, UserRole.END_USER)
  @Get('extensions')
  listExtensions(
    @CurrentUser() user: SessionUser,
    @Query('accountId') accountId?: string,
  ) {
    return this.extensions.list(user, accountId);
  }

  @Roles(...RETAIL_ROLES)
  @Post('extensions')
  createExtension(
    @CurrentUser() user: SessionUser,
    @Body() body: unknown,
    @Query('accountId') accountId?: string,
  ) {
    const parsed = createExtensionSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.extensions.create(user, parsed.data, accountId);
  }

  @Roles(...RETAIL_ROLES)
  @Patch('extensions/:id')
  updateExtension(
    @CurrentUser() user: SessionUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const parsed = updateExtensionSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.extensions.update(user, id, parsed.data);
  }

  @Roles(...RETAIL_ROLES)
  @Delete('extensions/:id')
  deleteExtension(@CurrentUser() user: SessionUser, @Param('id') id: string) {
    return this.extensions.remove(user, id);
  }

  // --- DIDs ---
  @Roles(...RETAIL_ROLES)
  @Get('dids')
  listDids(
    @CurrentUser() user: SessionUser,
    @Query('accountId') accountId?: string,
  ) {
    return this.dids.list(user, accountId);
  }

  @Roles(...RETAIL_ROLES)
  @Post('dids')
  createDid(
    @CurrentUser() user: SessionUser,
    @Body() body: unknown,
    @Query('accountId') accountId?: string,
  ) {
    const parsed = createDidSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.dids.create(user, parsed.data, accountId);
  }

  @Roles(...RETAIL_ROLES)
  @Patch('dids/:id')
  updateDid(
    @CurrentUser() user: SessionUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const parsed = updateDidSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.dids.update(user, id, parsed.data);
  }

  @Roles(...RETAIL_ROLES)
  @Delete('dids/:id')
  deleteDid(@CurrentUser() user: SessionUser, @Param('id') id: string) {
    return this.dids.remove(user, id);
  }

  // --- Ring groups ---
  @Roles(...RETAIL_ROLES)
  @Get('ring-groups')
  listRingGroups(
    @CurrentUser() user: SessionUser,
    @Query('accountId') accountId?: string,
  ) {
    return this.ringGroups.list(user, accountId);
  }

  @Roles(...RETAIL_ROLES)
  @Post('ring-groups')
  createRingGroup(
    @CurrentUser() user: SessionUser,
    @Body() body: unknown,
    @Query('accountId') accountId?: string,
  ) {
    const parsed = createRingGroupSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.ringGroups.create(user, parsed.data, accountId);
  }

  @Roles(...RETAIL_ROLES)
  @Delete('ring-groups/:id')
  deleteRingGroup(@CurrentUser() user: SessionUser, @Param('id') id: string) {
    return this.ringGroups.remove(user, id);
  }

  // --- Queues ---
  @Roles(...RETAIL_ROLES)
  @Get('queues')
  listQueues(
    @CurrentUser() user: SessionUser,
    @Query('accountId') accountId?: string,
  ) {
    return this.queues.list(user, accountId);
  }

  @Roles(...RETAIL_ROLES)
  @Post('queues')
  createQueue(
    @CurrentUser() user: SessionUser,
    @Body() body: unknown,
    @Query('accountId') accountId?: string,
  ) {
    const parsed = createQueueSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.queues.create(user, parsed.data, accountId);
  }

  @Roles(...RETAIL_ROLES)
  @Delete('queues/:id')
  deleteQueue(@CurrentUser() user: SessionUser, @Param('id') id: string) {
    return this.queues.remove(user, id);
  }

  // --- IVR ---
  @Roles(...RETAIL_ROLES)
  @Get('ivr')
  listIvr(
    @CurrentUser() user: SessionUser,
    @Query('accountId') accountId?: string,
  ) {
    return this.ivr.list(user, accountId);
  }

  @Roles(...RETAIL_ROLES)
  @Post('ivr')
  createIvr(
    @CurrentUser() user: SessionUser,
    @Body() body: unknown,
    @Query('accountId') accountId?: string,
  ) {
    const parsed = createIvrSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.ivr.create(user, parsed.data, accountId);
  }

  @Roles(...RETAIL_ROLES)
  @Delete('ivr/:id')
  deleteIvr(@CurrentUser() user: SessionUser, @Param('id') id: string) {
    return this.ivr.remove(user, id);
  }
}
