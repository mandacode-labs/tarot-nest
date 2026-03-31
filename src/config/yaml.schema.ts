import { z } from 'zod';
import {
  cardSchema,
  majorArcanaDefault,
  minorArcanaDefault,
  cardsDefault,
  keywordsDefault,
  tarotDefault,
} from './tarot_data';

const commonSystemMessage =
  '한국어로 서술해줘.' +
  '적절한 조언이 담긴 메시지를 서술해줘.' +
  '실제로 점술가가 말하는 것처럼 자연스럽게 설명해줘' +
  '직접적인 사용자의 정보는 사용하지마.' +
  '특수 문자 또한 사용하지마.' +
  '카드는 영어로 읽고 방향은 정방향, 역방향을 사용해 (eg. Five of Wands)' +
  '카드 설명시 카드의 영어이름을 말하고 정방향 또는 역방향의 의미를 알려줘' +
  '어투는 차갑게 해줘. ';

// Base YAML schema (all fields optional with defaults)
export const yamlSchema = z.object({
  server: z.object({
    nodeEnv: z
      .string()
      .transform((x) => x.toLowerCase())
      .refine((x) => ['development', 'production', 'test'].includes(x))
      .default('development'),
    port: z.number().int().positive().default(3000),
    corsOrigins: z.array(z.string()).default(['*']),
    corsCredentials: z.boolean().default(true),
  }),
  openai: z.object({
    apiKey: z.string().optional(),
    systemMessage: z.object({
      read: z
        .string()
        .default(
          '주어지는 카드에 대하여 타로 메시지를 서술해줘.' +
            '응답은 반드시 다음 JSON 형식을 따라야 해:' +
            '{ title: string, titleKR: string, keywords: string[], advice: string }' +
            'title은 카드의 영어 이름, titleKR은 카드의 한글 이름, ' +
            'keywords는 4개의 키워드 배열, advice는 조언 메시지.' +
            commonSystemMessage,
        ),
    }),
  }),
  tarot: z
    .object({
      cards: z
        .object({
          major: z.array(cardSchema).default(majorArcanaDefault),
          minor: z.object({
            wands: z.array(cardSchema).default(minorArcanaDefault.wands),
            cups: z.array(cardSchema).default(minorArcanaDefault.cups),
            swords: z.array(cardSchema).default(minorArcanaDefault.swords),
            pentacles: z
              .array(cardSchema)
              .default(minorArcanaDefault.pentacles),
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
    .default(tarotDefault),
  cache: z
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
        })
        .default({ host: 'valkey', port: 6379, db: 0 }),
    })
    .default({
      enabled: true,
      ttl: 3600,
      randomBucketSize: 10,
      valkey: { host: 'valkey', port: 6379, db: 0 },
    }),
});

export type YamlConfig = z.infer<typeof yamlSchema>;
