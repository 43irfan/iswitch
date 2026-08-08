import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { loginSchema } from '@iswitch/shared';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import type { SessionUser } from '@iswitch/shared';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new UnauthorizedException('Invalid login payload');
    }

    const user = await this.authService.validateUser(
      parsed.data.email.toLowerCase(),
      parsed.data.password,
    );
    const token = await this.authService.createSession(user.id);
    res.cookie(
      this.authService.cookieName,
      token,
      this.authService.cookieOptions(),
    );
    return { user, sessionToken: token };
  }

  @Public()
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[this.authService.cookieName] as
      | string
      | undefined;
    if (token) {
      await this.authService.destroySession(token);
    }
    res.clearCookie(this.authService.cookieName, { path: '/' });
    return { ok: true };
  }

  @Get('me')
  me(@CurrentUser() user: SessionUser) {
    return { user };
  }
}
