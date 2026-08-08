import { ForbiddenException, Injectable } from '@nestjs/common';
import type { SessionUser } from '@iswitch/shared';
import { UserRole } from '@iswitch/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenancyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Account IDs the user may see (self + subtree where applicable). */
  async getAccessibleAccountIds(user: SessionUser): Promise<string[]> {
    if (user.role === UserRole.SUPER_ADMIN) {
      const all = await this.prisma.account.findMany({ select: { id: true } });
      return all.map((a) => a.id);
    }

    if (user.role === UserRole.RESELLER) {
      const subtree = await this.collectSubtreeIds(user.accountId);
      return subtree;
    }

    return [user.accountId];
  }

  async assertCanAccessAccount(user: SessionUser, accountId: string) {
    const ids = await this.getAccessibleAccountIds(user);
    if (!ids.includes(accountId)) {
      throw new ForbiddenException('Account out of scope');
    }
  }

  private async collectSubtreeIds(rootId: string): Promise<string[]> {
    const result = [rootId];
    let frontier = [rootId];

    while (frontier.length > 0) {
      const children = await this.prisma.account.findMany({
        where: { parentId: { in: frontier } },
        select: { id: true },
      });
      frontier = children.map((c) => c.id);
      result.push(...frontier);
    }

    return result;
  }
}
