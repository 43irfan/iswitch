import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { SESSION_COOKIE, type SessionUser } from '@iswitch/shared';
import { PrismaService } from '../prisma/prisma.service';

const SESSION_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  get cookieName() {
    return SESSION_COOKIE;
  }

  cookieOptions() {
    const secure = this.config.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure,
      path: '/',
      maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    };
  }

  async validateUser(email: string, password: string): Promise<SessionUser> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { account: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.account.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is suspended');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.toSessionUser(user);
  }

  async createSession(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

    await this.prisma.session.create({
      data: { token, userId, expiresAt },
    });

    return token;
  }

  async getUserBySessionToken(token: string): Promise<SessionUser | null> {
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: {
        user: { include: { account: true } },
      },
    });

    if (!session) return null;
    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
      return null;
    }
    if (!session.user.isActive || session.user.account.status !== 'ACTIVE') {
      return null;
    }

    return this.toSessionUser(session.user);
  }

  async destroySession(token: string) {
    await this.prisma.session.deleteMany({ where: { token } });
  }

  private toSessionUser(user: {
    id: string;
    email: string;
    name: string | null;
    role: SessionUser['role'];
    accountId: string;
    account: { id: string; name: string; type: SessionUser['account']['type'] };
  }): SessionUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountId: user.accountId,
      account: {
        id: user.account.id,
        name: user.account.name,
        type: user.account.type,
      },
    };
  }
}
