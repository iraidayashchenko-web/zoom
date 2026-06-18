import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateMeetingDto } from './meeting.dto.js';
import { MeetingsService } from './meetings.service.js';
@ApiTags('meetings')
@ApiBearerAuth()
@Controller('meetings')
export class MeetingsController { constructor(private readonly meetings: MeetingsService) {} @Post() create(@Headers('x-user-id') userId: string, @Body() dto: CreateMeetingDto) { return this.meetings.create(userId, dto); } @Get() list(@Headers('x-user-id') userId: string) { return this.meetings.listForHost(userId); } }
