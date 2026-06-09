import { z } from 'zod';
import {
  cardSchema,
  majorArcanaDefault,
  minorArcanaDefault,
  cardsDefault,
  keywordsDefault,
  tarotDefault,
} from '../modules/tarot/data/cards';

const commonSystemMessage = [
  '한국어로 서술해줘.',
  '적절한 조언이 담긴 메시지를 서술해줘.',
  '실제로 점술가가 말하는 것처럼 자연스럽게 설명해줘',
  '직접적인 사용자의 정보는 사용하지마.',
  '특수 문자 또한 사용하지마.',
  '카드는 영어로 읽고 direction(방향)은 upright/reversed로 주어진다 (예: Five of Wands, upright)',
  '카드 설명시 카드의 영어이름을 말하고 해당 방향의 의미를 알려줘',
  '어투는 차갑게 해줘. ',
].join('');

const serverSchema = z.object({
  nodeEnv: z
    .string()
    .transform((x) => x.toLowerCase())
    .refine((x) => ['development', 'production', 'test'].includes(x))
    .default('development'),
  port: z.number().int().positive().default(3000),
  corsOrigins: z.array(z.string()).default(['*']),
  corsCredentials: z.boolean().default(true),
});

const tarotSchema = z
  .object({
    cards: z
      .object({
        major: z.array(cardSchema).default(majorArcanaDefault),
        minor: z.object({
          wands: z.array(cardSchema).default(minorArcanaDefault.wands),
          cups: z.array(cardSchema).default(minorArcanaDefault.cups),
          swords: z.array(cardSchema).default(minorArcanaDefault.swords),
          pentacles: z.array(cardSchema).default(minorArcanaDefault.pentacles),
        }),
      })
      .default(cardsDefault),
    keywords: z
      .object({
        emotion: z.array(z.string()).default(keywordsDefault.emotion),
        action: z.array(z.string()).default(keywordsDefault.action),
        time: z.array(z.string()).default(keywordsDefault.time),
        theme: z.array(z.string()).default(keywordsDefault.theme),
      })
      .default(keywordsDefault),
  })
  .default(tarotDefault);

const cacheSchema = z
  .object({
    enabled: z.boolean().default(true),
    ttl: z.number().int().positive().default(3600),
    randomBucketSize: z.number().int().positive().default(10),
    valkey: z
      .object({
        host: z.string().default('valkey'),
        port: z.number().int().positive().default(6379),
        password: z.string().optional(),
        db: z.number().int().min(0).max(15).default(0),
        prefix: z.string().optional(),
        username: z.string().optional(),
      })
      .default({ host: 'valkey', port: 6379, db: 0 }),
  })
  .default({
    enabled: true,
    ttl: 3600,
    randomBucketSize: 10,
    valkey: {
      host: 'valkey',
      port: 6379,
      db: 0,
    },
  });

export const configSchema = z.object({
  server: serverSchema,
  openai: z.object({
    apiKey: z.string().default(''),
    chatModel: z.string().default('gpt-4o-mini'),
    systemMessage: z.object({
      read: z.string().default(commonSystemMessage),
    }),
  }),
  tarot: tarotSchema,
  cache: cacheSchema,
});

export type Config = z.infer<typeof configSchema>;
