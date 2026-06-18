import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AvatarService } from './avatar.service.js';
import { CompleteAvatarUploadDto, CreateAvatarUploadDto } from './dto/avatar-upload.dto.js';
import { UpdateAccountSettingsDto } from './dto/update-account-settings.dto.js';
import { UpdatePreferencesDto } from './dto/update-preferences.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { presentUserProfile } from './users.presenter.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avatars: AvatarService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.findActiveUser(userId);
    return presentUserProfile(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.findActiveUser(userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        company: dto.company,
        timezone: dto.timezone,
        language: dto.language,
      },
    });
    return presentUserProfile(user);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    await this.findActiveUser(userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        cameraPreference: dto.cameraPreference,
        audioPreference: dto.audioPreference,
        notificationPreference: dto.notificationPreference ? { ...dto.notificationPreference, theme: dto.theme } : dto.theme ? { theme: dto.theme } : undefined,
      },
    });
    return presentUserProfile(user);
  }

  async updateAccountSettings(userId: string, dto: UpdateAccountSettingsDto) {
    await this.findActiveUser(userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        timezone: dto.timezone,
        language: dto.language,
        company: dto.company,
      },
    });
    return presentUserProfile(user);
  }

  createAvatarUpload(userId: string, dto: CreateAvatarUploadDto) {
    return this.avatars.createUpload(userId, dto);
  }

  async completeAvatarUpload(userId: string, dto: CompleteAvatarUploadDto) {
    if (!dto.storageKey.startsWith(`avatars/${userId}/`)) {
      throw new NotFoundException('Avatar upload was not found for the current user');
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: this.avatars.publicUrl(dto.storageKey) },
    });
    return presentUserProfile(user);
  }

  private async findActiveUser(userId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
