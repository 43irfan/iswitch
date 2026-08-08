import { Controller, Post, Body } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('sync-probe')
  probe(@Body() body: { entity?: string }) {
    return this.jobsService.enqueueSyncProbe(body.entity ?? 'extension');
  }
}
