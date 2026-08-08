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
  createCarrierTrunkSchema,
  createCustomerTrunkSchema,
  createRoutePrefixSchema,
  updateBillingSchema,
  updateCustomerTrunkSchema,
  UserRole,
} from '@iswitch/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CarrierTrunksService,
  CustomerTrunksService,
  RoutesService,
  WholesaleBillingService,
} from './wholesale.service';

const WHOLESALE_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.RESELLER,
  UserRole.WHOLESALE_CUSTOMER,
] as const;

const OPERATOR_ROLES = [UserRole.SUPER_ADMIN, UserRole.RESELLER] as const;

@Controller('wholesale')
export class WholesaleController {
  constructor(
    private readonly trunks: CustomerTrunksService,
    private readonly carriers: CarrierTrunksService,
    private readonly routes: RoutesService,
    private readonly billing: WholesaleBillingService,
  ) {}

  @Roles(...WHOLESALE_ROLES)
  @Get('trunks')
  listTrunks(
    @CurrentUser() user: SessionUser,
    @Query('accountId') accountId?: string,
  ) {
    return this.trunks.list(user, accountId);
  }

  @Roles(...WHOLESALE_ROLES)
  @Post('trunks')
  createTrunk(
    @CurrentUser() user: SessionUser,
    @Body() body: unknown,
    @Query('accountId') accountId?: string,
  ) {
    const parsed = createCustomerTrunkSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.trunks.create(user, parsed.data, accountId);
  }

  @Roles(...WHOLESALE_ROLES)
  @Patch('trunks/:id')
  updateTrunk(
    @CurrentUser() user: SessionUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const parsed = updateCustomerTrunkSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.trunks.update(user, id, parsed.data);
  }

  @Roles(...WHOLESALE_ROLES)
  @Delete('trunks/:id')
  deleteTrunk(@CurrentUser() user: SessionUser, @Param('id') id: string) {
    return this.trunks.remove(user, id);
  }

  @Roles(...OPERATOR_ROLES)
  @Get('carriers')
  listCarriers(@CurrentUser() user: SessionUser) {
    return this.carriers.list(user);
  }

  @Roles(...OPERATOR_ROLES)
  @Post('carriers')
  createCarrier(@CurrentUser() user: SessionUser, @Body() body: unknown) {
    const parsed = createCarrierTrunkSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.carriers.create(user, parsed.data);
  }

  @Roles(...OPERATOR_ROLES)
  @Delete('carriers/:id')
  deleteCarrier(@CurrentUser() user: SessionUser, @Param('id') id: string) {
    return this.carriers.remove(user, id);
  }

  @Roles(...OPERATOR_ROLES)
  @Get('routes')
  async listRoutes(@CurrentUser() user: SessionUser) {
    const rows = await this.routes.list(user);
    return rows.map((r) => this.routes.serializeRoute(r));
  }

  @Roles(...OPERATOR_ROLES)
  @Get('routes/match')
  async matchRoute(
    @CurrentUser() user: SessionUser,
    @Query('destination') destination?: string,
  ) {
    if (!destination) throw new BadRequestException('destination required');
    const match = await this.routes.match(user, destination);
    return match ? this.routes.serializeRoute(match) : null;
  }

  @Roles(...OPERATOR_ROLES)
  @Post('routes')
  createRoute(@CurrentUser() user: SessionUser, @Body() body: unknown) {
    const parsed = createRoutePrefixSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.routes.create(user, parsed.data);
  }

  @Roles(...OPERATOR_ROLES)
  @Delete('routes/:id')
  deleteRoute(@CurrentUser() user: SessionUser, @Param('id') id: string) {
    return this.routes.remove(user, id);
  }

  @Roles(...WHOLESALE_ROLES)
  @Get('billing')
  getBilling(
    @CurrentUser() user: SessionUser,
    @Query('accountId') accountId?: string,
  ) {
    return this.billing.getAccountBilling(user, accountId);
  }

  @Roles(...WHOLESALE_ROLES)
  @Get('credit-check')
  creditCheck(
    @CurrentUser() user: SessionUser,
    @Query('accountId') accountId?: string,
  ) {
    return this.billing.creditCheck(user, accountId);
  }

  @Roles(...OPERATOR_ROLES)
  @Patch('billing/:accountId')
  updateBilling(
    @CurrentUser() user: SessionUser,
    @Param('accountId') accountId: string,
    @Body() body: unknown,
  ) {
    const parsed = updateBillingSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.message);
    return this.billing.updateBilling(user, accountId, parsed.data);
  }
}
