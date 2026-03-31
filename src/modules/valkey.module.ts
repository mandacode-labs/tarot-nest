import { Global, Module } from '@nestjs/common';
import { ValkeyService } from 'src/services/valkey.service';

@Global()
@Module({
  providers: [ValkeyService],
  exports: [ValkeyService],
})
export class ValkeyModule {}
