import { MeetingType } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsEnum(MeetingType)
  type!: MeetingType;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  meetingPassword?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsBoolean()
  waitingRoom = true;

  @IsBoolean()
  recordingEnabled = false;

  @IsBoolean()
  chatEnabled = true;

  @IsBoolean()
  screenSharingEnabled = true;
}
