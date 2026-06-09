import { Test, TestingModule } from '@nestjs/testing';
import { TarotController } from './tarot.controller';
import { TarotService } from './tarot.service';
import type { ReadResponse } from './schemas/tarot-reading.schema';

describe('TarotController', () => {
  let controller: TarotController;

  const mockTarotService = {
    readTarot: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TarotController],
      providers: [
        {
          provide: TarotService,
          useValue: mockTarotService,
        },
      ],
    }).compile();

    controller = module.get<TarotController>(TarotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return tarot reading', async () => {
    const mockResponse: ReadResponse = {
      title: 'The Fool',
      titleKR: '바보',
      keywords: ['시작', '도전'],
      advice: '새로운 시작을 두려워하지 마세요.',
    };

    mockTarotService.readTarot.mockResolvedValue(mockResponse);

    const result = await controller.readTarot();

    expect(result).toEqual({
      message: 'success',
      data: mockResponse,
    });
    expect(mockTarotService.readTarot).toHaveBeenCalled();
  });
});
