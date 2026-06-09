import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { Config } from '../../config/schema';
import type { LlmReadResponse } from '../tarot/schemas/tarot-reading.schema';
import { llmReadResponseSchema } from '../tarot/schemas/tarot-reading.schema';
import type { TarotMessageRequest } from '../tarot/tarot.interface';

@Injectable()
export class OpenAIService {
  private openAI!: OpenAI;
  private openAIConfig: Config['openai'];

  constructor(private readonly config: ConfigService<Config, true>) {
    this.openAIConfig = this.config.get<Config['openai']>('openai');
  }

  onModuleInit() {
    if (!this.openAIConfig.apiKey) {
      Logger.warn(
        'OPENAI_API_KEY is not configured. Tarot reading will fail.',
        OpenAIService.name,
      );
      return;
    }

    this.openAI = new OpenAI({
      apiKey: this.openAIConfig.apiKey,
    });
  }

  async getTarotMessage(
    request: TarotMessageRequest,
  ): Promise<LlmReadResponse> {
    if (!this.openAI) {
      throw new InternalServerErrorException(
        'OpenAI client is not initialized. Check OPENAI_API_KEY configuration.',
      );
    }

    const response = await this.openAI.chat.completions.parse({
      model: this.openAIConfig.chatModel,
      messages: [
        {
          role: 'system',
          content: this.openAIConfig.systemMessage.read,
        },
        {
          role: 'user',
          content: JSON.stringify({
            card: request.card.name,
            cardKR: request.card.nameKR,
            direction: request.direction,
            keywords: request.keywords,
          }),
        },
      ],
      response_format: zodResponseFormat(llmReadResponseSchema, 'ReadResponse'),
    });

    if (!response.choices[0].message.parsed) {
      throw new InternalServerErrorException('OpenAI request failed');
    }

    return response.choices[0].message.parsed;
  }
}
