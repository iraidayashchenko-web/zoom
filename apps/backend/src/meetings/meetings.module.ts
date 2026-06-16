import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MeetingsController } from './meetings.controller.js';
import { MeetingsService } from './meetings.service.js';
@Module({ controllers: [MeetingsController], providers: [MeetingsService, PrismaService], exports: [MeetingsService] })
export class MeetingsModule {}
