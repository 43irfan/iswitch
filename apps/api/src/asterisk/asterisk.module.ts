import { Module } from '@nestjs/common';
import { AsteriskService } from './asterisk.service';
import { AsteriskController } from './asterisk.controller';

@Module({
  controllers: [AsteriskController],
  providers: [AsteriskService],
  exports: [AsteriskService],
})
export class AsteriskModule {}
