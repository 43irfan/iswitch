import { Injectable } from '@nestjs/common';
import { APP_NAME } from '@iswitch/shared';

@Injectable()
export class AppService {
  getRoot() {
    return {
      name: APP_NAME,
      message: 'iSwitch API — Phase 1 foundation',
    };
  }
}
