import { Controller, Get } from '@nestjs/common';
import { AsteriskService } from './asterisk.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@iswitch/shared';

@Controller('asterisk')
export class AsteriskController {
  constructor(private readonly asteriskService: AsteriskService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Get('status')
  status() {
    return this.asteriskService.getConfigStatus();
  }
}
