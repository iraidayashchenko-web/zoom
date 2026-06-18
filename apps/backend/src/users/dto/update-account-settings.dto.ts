import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAccountSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;
}
