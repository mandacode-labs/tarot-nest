import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/validate';
import { AppController } from './app.controller';
import { TarotModule } from './modules/tarot.module';
import { ValkeyModule } from './modules/valkey.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validate,
      isGlobal: true,
    }),
    ValkeyModule,
    TarotModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
