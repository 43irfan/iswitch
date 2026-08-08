import { Controller, Get } from '@nestjs/common';
import { APP_NAME } from '@iswitch/shared';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  root() {
    return this.appService.getRoot();
  }

  @Public()
  @Get('meta')
  meta() {
    return { name: APP_NAME, phase: 4 };
  }
}
