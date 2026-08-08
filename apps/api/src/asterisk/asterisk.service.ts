import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Phase 1 stub — real ARI/AMI clients land with retail sync. */
@Injectable()
export class AsteriskService {
  constructor(private readonly config: ConfigService) {}

  getConfigStatus() {
    return {
      ariUrl: this.config.get<string>('ASTERISK_ARI_URL'),
      ariApp: this.config.get<string>('ASTERISK_ARI_APP'),
      amiHost: this.config.get<string>('ASTERISK_AMI_HOST'),
      amiPort: Number(this.config.get<string>('ASTERISK_AMI_PORT') ?? 5038),
      connected: false,
      note: 'Stub only — connect Asterisk in Phase 3 sync work',
    };
  }
}
