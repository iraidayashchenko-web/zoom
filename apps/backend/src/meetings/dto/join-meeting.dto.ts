import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class JoinMeetingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  displayName!: string;

  @IsOptional()
  @IsString()
  meetingPassword?: string;
}
