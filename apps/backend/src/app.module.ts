import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module.js';
import { MeetingsModule } from './meetings/meetings.module.js';
import { SignalingGateway } from './signaling/signaling.gateway.js';
import { PrismaService } from './prisma/prisma.service.js';
import { HealthController } from './health/health.controller.js';
@Module({ imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]), AuthModule, MeetingsModule], controllers: [HealthController], providers: [PrismaService, SignalingGateway] })
export class AppModule {}
