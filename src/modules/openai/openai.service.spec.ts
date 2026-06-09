import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import type { TarotMessageRequest } from '../tarot/tarot.interface';

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          parse: jest.fn(),
        },
      },
    })),
  };
});

const MockOpenAI = jest.requireMock('openai').default;

describe('OpenAIService', () => {
  let service: OpenAIService;
  let configService: jest.Mocked<ConfigService>;

  const mockConfig = {
    openai: {
      apiKey: 'sk-test-key',
      chatModel: 'gpt-4o-mini',
      systemMessage: {
        read: 'test system message',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockConfig.openai),
          },
        },
      ],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize OpenAI client when API key is provided', () => {
      service.onModuleInit();

      expect(MockOpenAI).toHaveBeenCalledWith({ apiKey: 'sk-test-key' });
    });

    it('should warn and skip initialization when API key is empty', () => {
      configService.get.mockReturnValue({
        apiKey: '',
        chatModel: 'gpt-4o-mini',
        systemMessage: { read: 'msg' },
      });

      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});

      const serviceWithNoKey = new OpenAIService(configService);
      serviceWithNoKey.onModuleInit();

      expect(warnSpy).toHaveBeenCalledWith(
        'OPENAI_API_KEY is not configured. Tarot reading will fail.',
        OpenAIService.name,
      );
      expect(MockOpenAI).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('getTarotMessage', () => {
    it('should throw when OpenAI client is not initialized', async () => {
      configService.get.mockReturnValue({
        apiKey: '',
        chatModel: 'gpt-4o-mini',
        systemMessage: { read: 'msg' },
      });

      const serviceWithNoKey = new OpenAIService(configService);

      const request: TarotMessageRequest = {
        card: {
          id: 'major-0',
          name: 'The Fool',
          nameKR: '바보',
          type: 'major',
        },
        direction: 'upright',
        keywords: ['사랑', '시작'],
      };

      await expect(serviceWithNoKey.getTarotMessage(request)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should return parsed response from OpenAI', async () => {
      service.onModuleInit();

      const mockParse = jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              parsed: { advice: '타로 메시지입니다.' },
            },
          },
        ],
      });

      const mockClient = MockOpenAI.mock.results[0].value;
      mockClient.chat.completions.parse = mockParse;

      const request: TarotMessageRequest = {
        card: {
          id: 'major-0',
          name: 'The Fool',
          nameKR: '바보',
          type: 'major',
        },
        direction: 'reversed',
        keywords: ['변화', '극복'],
      };

      const result = await service.getTarotMessage(request);

      expect(result).toEqual({ advice: '타로 메시지입니다.' });
      expect(mockParse).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('"direction":"reversed"'),
            }),
          ]),
        }),
      );
    });

    it('should throw when OpenAI returns no parsed message', async () => {
      service.onModuleInit();

      const mockParse = jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              parsed: null,
            },
          },
        ],
      });

      const mockClient = MockOpenAI.mock.results[0].value;
      mockClient.chat.completions.parse = mockParse;

      const request: TarotMessageRequest = {
        card: {
          id: 'major-0',
          name: 'The Fool',
          nameKR: '바보',
          type: 'major',
        },
        direction: 'upright',
        keywords: ['사랑'],
      };

      await expect(service.getTarotMessage(request)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
