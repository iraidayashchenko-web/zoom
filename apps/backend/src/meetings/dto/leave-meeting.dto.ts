import { IsOptional, IsString, MaxLength } from 'class-validator';

export class LeaveMeetingDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
