import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { createGlobalValidationPipe } from './common/pipes/global-validation.pipe.js';
import { AppLogger } from './logger/logger.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = app.get(AppLogger);

  app.useLogger(logger);
  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.enableCors({ origin: config.get<string[]>('app.corsOrigins') ?? ['http://localhost:3000'], credentials: true });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(createGlobalValidationPipe());
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NovaMeet API')
    .setDescription('REST and realtime control APIs for NovaMeet')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = config.get<number>('app.port') ?? 4000;
  await app.listen(port);
  logger.log(`NovaMeet backend listening on port ${port}`);
}

void bootstrap();
