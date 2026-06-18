import { Body, Controller, Delete, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { JwtPayload } from '../auth/types.js';
import { CreateMeetingDto, JoinMeetingDto, LeaveMeetingDto } from './meeting.dto.js';
import { MeetingsService } from './meetings.service.js';

@ApiTags('meetings')
@ApiBearerAuth()
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetings: MeetingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() request: Request & { user: JwtPayload }, @Body() dto: CreateMeetingDto) {
    return this.meetings.create(request.user.sub, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Req() request: Request & { user: JwtPayload }) {
    return this.meetings.listForHost(request.user.sub);
  }

  @Post(':meetingId/join')
  join(@Param('meetingId') meetingId: string, @Body() dto: JoinMeetingDto, @Headers('x-user-id') guestUserId?: string) {
    return this.meetings.join(meetingId, guestUserId, dto);
  }

  @Post(':meetingId/leave')
  @UseGuards(JwtAuthGuard)
  leave(@Param('meetingId') meetingId: string, @Req() request: Request & { user: JwtPayload }, @Body() _dto: LeaveMeetingDto) {
    return this.meetings.leave(meetingId, request.user.sub);
  }

  @Delete(':meetingId')
  @UseGuards(JwtAuthGuard)
  delete(@Param('meetingId') meetingId: string, @Req() request: Request & { user: JwtPayload }) {
    return this.meetings.delete(meetingId, request.user.sub);
  }
}
