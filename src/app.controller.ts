import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  @HttpCode(200)
  getHealth(): string {
    return 'OK';
  }
}
