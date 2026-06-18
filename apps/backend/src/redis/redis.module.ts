import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AppLogger } from '../logger/logger.service.js';
import { REDIS_CLIENT } from './redis.constants.js';
import { RedisService } from './redis.service.js';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService, AppLogger],
      useFactory: (config: ConfigService, logger: AppLogger) => {
        const client = new Redis(config.get<string>('redis.url') ?? 'redis://localhost:6379', {
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
        });
        client.on('connect', () => logger.log('Redis connection established'));
        client.on('error', (error) => logger.error(`Redis connection error: ${error.message}`, error.stack));
        return client;
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
