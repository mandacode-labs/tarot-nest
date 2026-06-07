import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { ValkeyService } from './valkey.service';
import type { ReadResponse } from 'src/schemas/service/read.schema';
import type { Config } from 'src/config/config.schema';

export interface TarotCard {
  id: string;
  name: string;
  nameKR: string;
  type: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
}

@Injectable()
export class TarotService {
  private allCards: TarotCard[];
  private allKeywords: string[];
  private cacheConfig: Config['cache'];

  constructor(
    private readonly openAIService: OpenAIService,
    private readonly valkeyService: ValkeyService,
    private readonly config: ConfigService<Config, true>,
  ) {
    const tarotConfig = this.config.get<Config['tarot']>('tarot');
    this.cacheConfig = this.config.get<Config['cache']>('cache');
    this.allCards = this.buildAllCards(tarotConfig.cards);
    this.allKeywords = this.buildAllKeywords(tarotConfig.keywords);
  }

  private buildAllCards(cardsConfig: Config['tarot']['cards']): TarotCard[] {
    const major: TarotCard[] = cardsConfig.major.map((card) => ({
      ...card,
      type: 'major' as const,
    }));

    const suits = ['wands', 'cups', 'swords', 'pentacles'] as const;
    const minor: TarotCard[] = suits.flatMap((suit) =>
      cardsConfig.minor[suit].map((card) => ({
        ...card,
        type: 'minor' as const,
        suit,
      })),
    );

    return [...major, ...minor];
  }

  private buildAllKeywords(
    keywordsConfig: Config['tarot']['keywords'],
  ): string[] {
    return [
      ...keywordsConfig.emotion,
      ...keywordsConfig.action,
      ...keywordsConfig.time,
      ...keywordsConfig.theme,
    ];
  }

  private getRandomCard(): TarotCard {
    const idx = Math.floor(Math.random() * this.allCards.length);
    return this.allCards[idx];
  }

  private getRandomDirection(): 'upright' | 'reversed' {
    return Math.random() < 0.5 ? 'upright' : 'reversed';
  }

  private getRandomKeywords(count: number = 4): string[] {
    const shuffled = [...this.allKeywords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private buildCacheKey(
    card: TarotCard,
    direction: 'upright' | 'reversed',
    bucket: number,
  ): string {
    return `tarot:read:${card.id}:${direction}:${bucket}`;
  }

  private getRandomBucket(): number {
    return Math.floor(Math.random() * this.cacheConfig.randomBucketSize) + 1;
  }

  /**
   * Read tarot message
   * @returns ReadResponse
   */
  async readTarot(): Promise<ReadResponse> {
    const card = this.getRandomCard();
    const direction = this.getRandomDirection();
    const bucket = this.getRandomBucket();
    const cacheKey = this.buildCacheKey(card, direction, bucket);

    if (this.valkeyService.isEnabled()) {
      const cached = await this.valkeyService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as ReadResponse;
      }
    }

    const keywords = this.getRandomKeywords(4);
    const llmResult = await this.openAIService.getTarotMessage({
      card,
      direction,
      keywords,
    });

    const result: ReadResponse = {
      title: card.name,
      titleKR: card.nameKR,
      keywords: llmResult.keywords,
      advice: llmResult.advice,
    };

    if (this.valkeyService.isEnabled()) {
      await this.valkeyService.set(cacheKey, JSON.stringify(result));
    }

    return result;
  }
}
