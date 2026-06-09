import { Controller, Get } from '@nestjs/common';
import { ResponseData } from '../../common/interfaces/response.interface';
import { ReadResponse } from './schemas/tarot-reading.schema';
import { TarotService } from './tarot.service';

@Controller('tarot')
export class TarotController {
  constructor(private readonly tarotService: TarotService) {}

  @Get('read')
  async readTarot(): Promise<ResponseData<ReadResponse>> {
    const result = await this.tarotService.readTarot();
    return {
      message: 'success',
      data: result,
    };
  }
}
