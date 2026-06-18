import { IsUUID } from 'class-validator';

export class MeetingParamsDto {
  @IsUUID()
  meetingId!: string;
}
