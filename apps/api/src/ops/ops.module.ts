import { Global, Module } from '@nestjs/common';
import { AsteriskModule } from '../asterisk/asterisk.module';
import { JobsModule } from '../jobs/jobs.module';
import { AuditService } from './audit.service';
import { FraudService } from './fraud.service';
import { OpsService } from './ops.service';
import { OpsController } from './ops.controller';

@Global()
@Module({
  imports: [AsteriskModule, JobsModule],
  controllers: [OpsController],
  providers: [AuditService, FraudService, OpsService],
  exports: [AuditService, FraudService, OpsService],
})
export class OpsModule {}
