import { Module } from '@nestjs/common';
import { TarotController } from './tarot.controller';
import { OpenAIModule } from '../openai/openai.module';
import { TarotService } from './tarot.service';

@Module({
  imports: [OpenAIModule],
  controllers: [TarotController],
  providers: [TarotService],
})
export class TarotModule {}
