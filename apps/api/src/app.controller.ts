import { Controller, Get } from '@nestjs/common';
import { APP_NAME } from '@iswitch/shared';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root() {
    return this.appService.getRoot();
  }

  @Get('meta')
  meta() {
    return { name: APP_NAME, phase: 1 };
  }
}
