import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MeetingStatus, MeetingType, ParticipantStatus } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { MeetingsService } from '../meetings.service.js';

function createPrismaMock() {
  return {
    meeting: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    meetingParticipant: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    message: { updateMany: vi.fn() },
    poll: { updateMany: vi.fn() },
    $transaction: vi.fn((operations) => Promise.all(operations)),
  };
}

describe('MeetingsService', () => {
  it('creates instant meetings as live meetings with host participant', async () => {
    const prisma = createPrismaMock();
    prisma.meeting.create.mockResolvedValue({ id: 'meeting-1' });
    const service = new MeetingsService(prisma as never);

    await service.create('host-1', {
      title: 'Daily standup',
      startsAt: '2026-06-18T10:00:00.000Z',
      endsAt: '2026-06-18T10:30:00.000Z',
      type: MeetingType.INSTANT,
      waitingRoom: true,
      recordingEnabled: false,
      chatEnabled: true,
      screenSharingEnabled: true,
    });

    expect(prisma.meeting.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: MeetingStatus.LIVE, hostId: 'host-1' }),
    }));
  });

  it('rejects invalid meeting windows', async () => {
    const service = new MeetingsService(createPrismaMock() as never);
    await expect(service.create('host-1', {
      title: 'Bad meeting',
      startsAt: '2026-06-18T11:00:00.000Z',
      endsAt: '2026-06-18T10:00:00.000Z',
      type: MeetingType.SCHEDULED,
      waitingRoom: true,
      recordingEnabled: false,
      chatEnabled: true,
      screenSharingEnabled: true,
    })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('joins a waiting-room meeting as waiting participant', async () => {
    const prisma = createPrismaMock();
    prisma.meeting.findFirst.mockResolvedValue({
      id: 'meeting-1',
      hostId: 'host-1',
      passwordHash: null,
      settings: { waitingRoom: true, locked: false },
    });
    prisma.meetingParticipant.findFirst.mockResolvedValue(null);
    prisma.meetingParticipant.create.mockResolvedValue({ id: 'participant-1', status: ParticipantStatus.WAITING });
    const service = new MeetingsService(prisma as never);

    const result = await service.join('meeting-1', 'user-1', { displayName: 'Ada' });

    expect(result.status).toBe(ParticipantStatus.WAITING);
    expect(prisma.meetingParticipant.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ meetingId: 'meeting-1', userId: 'user-1' }),
    }));
  });

  it('rejects joining locked meetings', async () => {
    const prisma = createPrismaMock();
    prisma.meeting.findFirst.mockResolvedValue({
      id: 'meeting-1',
      hostId: 'host-1',
      passwordHash: null,
      settings: { waitingRoom: false, locked: true },
    });
    const service = new MeetingsService(prisma as never);

    await expect(service.join('meeting-1', 'user-1', { displayName: 'Ada' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('leaves meetings by updating participant state', async () => {
    const prisma = createPrismaMock();
    prisma.meetingParticipant.findFirst.mockResolvedValue({ id: 'participant-1' });
    prisma.meetingParticipant.update.mockResolvedValue({ id: 'participant-1', status: ParticipantStatus.LEFT });
    const service = new MeetingsService(prisma as never);

    const result = await service.leave('meeting-1', 'user-1');

    expect(result.status).toBe(ParticipantStatus.LEFT);
  });

  it('requires host ownership to delete meetings', async () => {
    const prisma = createPrismaMock();
    prisma.meeting.findFirst.mockResolvedValue({ id: 'meeting-1', hostId: 'host-1' });
    const service = new MeetingsService(prisma as never);

    await expect(service.delete('meeting-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws not found when deleting missing meetings', async () => {
    const prisma = createPrismaMock();
    prisma.meeting.findFirst.mockResolvedValue(null);
    const service = new MeetingsService(prisma as never);

    await expect(service.delete('missing', 'host-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
