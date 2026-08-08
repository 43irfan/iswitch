import { Controller, Get } from '@nestjs/common';
import { AsteriskService } from './asterisk.service';

@Controller('asterisk')
export class AsteriskController {
  constructor(private readonly asteriskService: AsteriskService) {}

  @Get('status')
  status() {
    return this.asteriskService.getConfigStatus();
  }
}
