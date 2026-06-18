import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MeetingStatus, ParticipantRole, ParticipantStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMeetingDto, JoinMeetingDto } from './meeting.dto.js';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(hostId: string, dto: CreateMeetingDto) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    this.validateMeetingWindow(startsAt, endsAt);

    return this.prisma.meeting.create({
      data: {
        hostId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        status: dto.type === 'INSTANT' ? MeetingStatus.LIVE : MeetingStatus.SCHEDULED,
        startsAt,
        endsAt,
        recurrenceRule: dto.recurrenceRule,
        timezone: dto.timezone ?? 'UTC',
        passwordHash: dto.meetingPassword ? await bcrypt.hash(dto.meetingPassword, 12) : undefined,
        settings: {
          create: {
            waitingRoom: dto.waitingRoom,
            recordingEnabled: dto.recordingEnabled,
            chatEnabled: dto.chatEnabled,
            screenSharingEnabled: dto.screenSharingEnabled,
          },
        },
        participants: {
          create: {
            userId: hostId,
            displayName: 'Host',
            role: ParticipantRole.HOST,
            status: ParticipantStatus.JOINED,
            joinedAt: new Date(),
          },
        },
      },
      include: { settings: true, participants: true },
    });
  }

  async join(meetingId: string, userId: string | undefined, dto: JoinMeetingDto) {
    const meeting = await this.getJoinableMeeting(meetingId);
    if (meeting.passwordHash && (!dto.meetingPassword || !(await bcrypt.compare(dto.meetingPassword, meeting.passwordHash)))) {
      throw new ForbiddenException('Invalid meeting password');
    }
    if (meeting.settings?.locked) {
      throw new ForbiddenException('Meeting is locked');
    }

    const existing = userId
      ? await this.prisma.meetingParticipant.findFirst({ where: { meetingId, userId, deletedAt: null } })
      : undefined;
    const status = meeting.settings?.waitingRoom && meeting.hostId !== userId ? ParticipantStatus.WAITING : ParticipantStatus.JOINED;
    const joinedAt = status === ParticipantStatus.JOINED ? new Date() : undefined;

    if (existing) {
      return this.prisma.meetingParticipant.update({
        where: { id: existing.id },
        data: { displayName: dto.displayName, status, joinedAt, leftAt: null },
      });
    }

    return this.prisma.meetingParticipant.create({
      data: {
        meetingId,
        userId,
        displayName: dto.displayName,
        role: meeting.hostId === userId ? ParticipantRole.HOST : ParticipantRole.ATTENDEE,
        status,
        joinedAt,
      },
    });
  }

  async leave(meetingId: string, userId: string) {
    const participant = await this.prisma.meetingParticipant.findFirst({ where: { meetingId, userId, deletedAt: null } });
    if (!participant) {
      throw new NotFoundException('Meeting participant not found');
    }
    return this.prisma.meetingParticipant.update({
      where: { id: participant.id },
      data: { status: ParticipantStatus.LEFT, leftAt: new Date() },
    });
  }

  async delete(meetingId: string, userId: string) {
    const meeting = await this.prisma.meeting.findFirst({ where: { id: meetingId, deletedAt: null } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.hostId !== userId) {
      throw new ForbiddenException('Only the host can delete this meeting');
    }
    const deletedAt = new Date();
    await this.prisma.$transaction([
      this.prisma.meeting.update({ where: { id: meetingId }, data: { status: MeetingStatus.CANCELLED, deletedAt } }),
      this.prisma.meetingParticipant.updateMany({ where: { meetingId, deletedAt: null }, data: { deletedAt, status: ParticipantStatus.REMOVED } }),
      this.prisma.message.updateMany({ where: { meetingId, deletedAt: null }, data: { deletedAt } }),
      this.prisma.poll.updateMany({ where: { meetingId, deletedAt: null }, data: { deletedAt } }),
    ]);
    return { success: true, deletedAt };
  }

  listForHost(hostId: string) {
    return this.prisma.meeting.findMany({
      where: { hostId, deletedAt: null },
      orderBy: { startsAt: 'desc' },
      include: { settings: true },
    });
  }

  private async getJoinableMeeting(meetingId: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: { id: meetingId, deletedAt: null, status: { in: [MeetingStatus.SCHEDULED, MeetingStatus.LIVE] } },
      include: { settings: true },
    });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    return meeting;
  }

  private validateMeetingWindow(startsAt: Date, endsAt: Date) {
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid meeting time range');
    }
    if (endsAt <= startsAt) {
      throw new BadRequestException('Meeting end time must be after start time');
    }
  }
}
