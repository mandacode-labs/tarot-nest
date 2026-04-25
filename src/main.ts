import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import type { Config } from './config/config.schema';
import { HttpExceptionFilter } from './filters/http_exception.filter';
import { ZodExceptionFilter } from './filters/zod_exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Config, true>);
  const config = configService.get('server', { infer: true });

  app.enableCors({
    origin: config.corsOrigins.includes('*') ? true : config.corsOrigins,
    credentials: config.corsCredentials,
  });

  await app.listen(config.port);

  // Implement global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(), new ZodExceptionFilter());
}
bootstrap().catch(console.error);
