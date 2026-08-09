import { Controller, Post, Body } from '@nestjs/common';
import { UserRole } from '@iswitch/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post('sync-probe')
  probe(@Body() body: { entity?: string }) {
    return this.jobsService.enqueueSyncProbe(body.entity ?? 'extension');
  }
}
