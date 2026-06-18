import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class GoogleOAuthProfileDto {
  @IsString()
  googleId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
