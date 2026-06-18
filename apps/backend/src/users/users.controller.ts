import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { JwtPayload } from '../auth/types.js';
import { CompleteAvatarUploadDto, CreateAvatarUploadDto } from './dto/avatar-upload.dto.js';
import { UpdateAccountSettingsDto } from './dto/update-account-settings.dto.js';
import { UpdatePreferencesDto } from './dto/update-preferences.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  profile(@Req() request: Request & { user: JwtPayload }) {
    return this.users.getProfile(request.user.sub);
  }

  @Patch('me')
  updateProfile(@Req() request: Request & { user: JwtPayload }, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(request.user.sub, dto);
  }

  @Patch('me/preferences')
  updatePreferences(@Req() request: Request & { user: JwtPayload }, @Body() dto: UpdatePreferencesDto) {
    return this.users.updatePreferences(request.user.sub, dto);
  }

  @Patch('me/settings')
  updateAccountSettings(@Req() request: Request & { user: JwtPayload }, @Body() dto: UpdateAccountSettingsDto) {
    return this.users.updateAccountSettings(request.user.sub, dto);
  }

  @Post('me/avatar/upload-url')
  createAvatarUpload(@Req() request: Request & { user: JwtPayload }, @Body() dto: CreateAvatarUploadDto) {
    return this.users.createAvatarUpload(request.user.sub, dto);
  }

  @Post('me/avatar/complete')
  completeAvatarUpload(@Req() request: Request & { user: JwtPayload }, @Body() dto: CompleteAvatarUploadDto) {
    return this.users.completeAvatarUpload(request.user.sub, dto);
  }
}
