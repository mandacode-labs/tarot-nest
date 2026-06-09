import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import type { Config } from './config/schema';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Config, true>);
  const config = configService.get('server', { infer: true });

  app.enableCors({
    origin: config.corsOrigins.includes('*') ? true : config.corsOrigins,
    credentials: config.corsCredentials,
  });

  app.useGlobalFilters(new HttpExceptionFilter(), new ZodExceptionFilter());

  await app.listen(config.port);
}
bootstrap().catch(console.error);
