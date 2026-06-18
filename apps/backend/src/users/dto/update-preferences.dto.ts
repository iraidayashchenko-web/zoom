import { IsBoolean, IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class DevicePreferenceDto {
  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class NotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  inApp?: boolean;

  @IsOptional()
  @IsBoolean()
  meetingReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  recordingReady?: boolean;
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsObject()
  cameraPreference?: DevicePreferenceDto;

  @IsOptional()
  @IsObject()
  audioPreference?: DevicePreferenceDto;

  @IsOptional()
  @IsObject()
  notificationPreference?: NotificationPreferenceDto;

  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system';
}
