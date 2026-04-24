import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { ChatModel } from 'openai/resources';
import type { Config } from 'src/config/config.schema';
import type { ReadResponse } from 'src/schemas/service/read.schema';
import { readResponseSchema } from 'src/schemas/service/read.schema';
import type { TarotCard } from 'src/services/tarot.service';

interface TarotMessageRequest {
  card: TarotCard;
  direction: 'upright' | 'reversed';
  keywords: string[];
}

@Injectable()
export class OpenAIService {
  private chatModel: ChatModel = 'gpt-4o-mini';

  private openAI!: OpenAI;
  private openAIConfig: Config['openai'];

  constructor(private readonly config: ConfigService<Config, true>) {
    this.openAIConfig = this.config.get<Config['openai']>('openai');
  }

  onModuleInit() {
    this.openAI = new OpenAI({
      apiKey: this.openAIConfig.apiKey,
    });
  }

  /**
   * Get tarot message
   * @param request TarotMessageRequest
   * @returns ReadResponse
   */
  async getTarotMessage(request: TarotMessageRequest): Promise<ReadResponse> {
    const directionText = request.direction === 'upright' ? '정방향' : '역방향';

    const response = await this.openAI.chat.completions.parse({
      model: this.chatModel,
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
            direction: directionText,
            keywords: request.keywords,
          }),
        },
      ],
      response_format: zodResponseFormat(readResponseSchema, 'ReadResponse'),
    });

    if (!response.choices[0].message.parsed) {
      throw new InternalServerErrorException('OpenAI request failed');
    }

    return response.choices[0].message.parsed;
  }
}
