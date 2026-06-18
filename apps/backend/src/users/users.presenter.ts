import { User } from '@prisma/client';

export function presentUserProfile(user: User) {
  return {
    id: user.id,
    email: user.email,
    emailVerifiedAt: user.emailVerifiedAt,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
    name: user.name,
    timezone: user.timezone,
    language: user.language,
    company: user.company,
    cameraPreference: user.cameraPreference,
    audioPreference: user.audioPreference,
    notificationPreference: user.notificationPreference,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
