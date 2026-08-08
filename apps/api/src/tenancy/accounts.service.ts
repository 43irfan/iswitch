import { Injectable } from '@nestjs/common';
import type { SessionUser } from '@iswitch/shared';
import { UserRole } from '@iswitch/shared';
import { PrismaService } from '../prisma/prisma.service';
import { TenancyService } from './tenancy.service';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancy: TenancyService,
  ) {}

  async getMine(user: SessionUser) {
    return this.prisma.account.findUniqueOrThrow({
      where: { id: user.accountId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        parentId: true,
        createdAt: true,
      },
    });
  }

  async listScoped(user: SessionUser) {
    const ids = await this.tenancy.getAccessibleAccountIds(user);
    return this.prisma.account.findMany({
      where: { id: { in: ids } },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        parentId: true,
        createdAt: true,
        _count: { select: { users: true, children: true } },
      },
    });
  }

  async listDirectChildren(user: SessionUser) {
    if (
      user.role !== UserRole.SUPER_ADMIN &&
      user.role !== UserRole.RESELLER
    ) {
      return [];
    }

    const parentId =
      user.role === UserRole.SUPER_ADMIN ? user.accountId : user.accountId;

    // Super admin: show all resellers (children of platform + any reseller-level)
    if (user.role === UserRole.SUPER_ADMIN) {
      return this.prisma.account.findMany({
        where: { type: 'RESELLER' },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          parentId: true,
          _count: { select: { children: true, users: true } },
        },
      });
    }

    return this.prisma.account.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        parentId: true,
        _count: { select: { children: true, users: true } },
      },
    });
  }
}
