import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TarotService } from './tarot.service';
import { OpenAIService } from '../openai/openai.service';
import { ValkeyService } from '../valkey/valkey.service';
import type { ReadResponse } from './schemas/tarot-reading.schema';

describe('TarotService', () => {
  let service: TarotService;
  let valkeyService: jest.Mocked<ValkeyService>;
  let openAIService: jest.Mocked<OpenAIService>;

  const mockConfig = {
    tarot: {
      cards: {
        major: [
          { id: 'major-0', name: 'The Fool', nameKR: '바보' },
          { id: 'major-1', name: 'The Magician', nameKR: '마법사' },
        ],
        minor: {
          wands: [
            { id: 'wands-ace', name: 'Ace of Wands', nameKR: '지팡이 에이스' },
          ],
          cups: [],
          swords: [],
          pentacles: [],
        },
      },
      keywords: {
        emotion: ['사랑', '희망'],
        action: ['시작', '변화'],
        time: ['새로운 시작', '과거의 정리'],
        theme: ['인간관계', '진로'],
      },
    },
    cache: {
      enabled: true,
      ttl: 3600,
      randomBucketSize: 10,
      valkey: { host: 'valkey', port: 6379, db: 0 },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarotService,
        {
          provide: OpenAIService,
          useValue: { getTarotMessage: jest.fn() },
        },
        {
          provide: ValkeyService,
          useValue: {
            isEnabled: jest.fn(),
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'tarot') return mockConfig.tarot;
              if (key === 'cache') return mockConfig.cache;
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TarotService>(TarotService);
    valkeyService = module.get(ValkeyService);
    openAIService = module.get(OpenAIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('readTarot', () => {
    it('should return cached data on cache hit without calling OpenAI', async () => {
      const cachedResponse: ReadResponse = {
        title: 'The Fool',
        titleKR: '바보',
        keywords: ['사랑', '시작'],
        advice: 'cached advice',
      };

      valkeyService.isEnabled.mockReturnValue(true);
      valkeyService.get.mockResolvedValue(JSON.stringify(cachedResponse));

      const result = await service.readTarot();

      expect(result).toEqual(cachedResponse);
      expect(openAIService.getTarotMessage).not.toHaveBeenCalled();
      expect(valkeyService.set).not.toHaveBeenCalled();
    });

    it('should call OpenAI and cache result on cache miss', async () => {
      valkeyService.isEnabled.mockReturnValue(true);
      valkeyService.get.mockResolvedValue(null);
      openAIService.getTarotMessage.mockResolvedValue({ advice: 'ai advice' });

      const result = await service.readTarot();

      expect(openAIService.getTarotMessage).toHaveBeenCalledTimes(1);
      expect(valkeyService.set).toHaveBeenCalledTimes(1);
      expect(result.advice).toBe('ai advice');
      expect(result.keywords).toHaveLength(4);
      expect(result.title).toBeTruthy();
      expect(result.titleKR).toBeTruthy();

      const setArgs = valkeyService.set.mock.calls[0];
      expect(setArgs[0]).toMatch(
        /^tarot:read:[a-z0-9-]+:(upright|reversed):\d+$/,
      );
      expect(setArgs[1]).toBe(JSON.stringify(result));
    });

    it('should not use cache when cache is disabled', async () => {
      valkeyService.isEnabled.mockReturnValue(false);
      openAIService.getTarotMessage.mockResolvedValue({ advice: 'ai advice' });

      const result = await service.readTarot();

      expect(valkeyService.get).not.toHaveBeenCalled();
      expect(valkeyService.set).not.toHaveBeenCalled();
      expect(openAIService.getTarotMessage).toHaveBeenCalledTimes(1);
      expect(result.advice).toBe('ai advice');
    });

    it('should pass correct card and direction to OpenAI', async () => {
      valkeyService.isEnabled.mockReturnValue(false);
      openAIService.getTarotMessage.mockResolvedValue({ advice: 'ai advice' });

      jest.spyOn(service as any, 'getRandomCard').mockReturnValue({
        id: 'major-0',
        name: 'The Fool',
        nameKR: '바보',
        type: 'major',
      });
      jest
        .spyOn(service as any, 'getRandomDirection')
        .mockReturnValue('upright');

      await service.readTarot();

      expect(openAIService.getTarotMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          card: expect.objectContaining({ id: 'major-0' }),
          direction: 'upright',
          keywords: expect.arrayContaining([expect.any(String)]),
        }),
      );
    });
  });
});
