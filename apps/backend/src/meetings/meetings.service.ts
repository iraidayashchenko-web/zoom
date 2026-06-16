import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMeetingDto } from './meeting.dto.js';
@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(hostId: string, dto: CreateMeetingDto) { return this.prisma.meeting.create({ data: { hostId, title: dto.title, description: dto.description, type: dto.type, startsAt: new Date(dto.startsAt), endsAt: new Date(dto.endsAt), passwordHash: dto.meetingPassword ? await bcrypt.hash(dto.meetingPassword, 12) : undefined, settings: { create: { waitingRoom: dto.waitingRoom, recordingEnabled: dto.recordingEnabled, chatEnabled: dto.chatEnabled, screenSharingEnabled: dto.screenSharingEnabled } } }, include: { settings: true } }); }
  listForHost(hostId: string) { return this.prisma.meeting.findMany({ where: { hostId }, orderBy: { startsAt: 'desc' }, include: { settings: true } }); }
}
