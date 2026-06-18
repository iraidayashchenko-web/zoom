import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { GoogleOAuthProfileDto, LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto.js';
import { AuthTokens } from './types.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const email = dto.email.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Email already registered');
    }
    const user = await this.prisma.user.create({
      data: { email, name: dto.name, passwordHash: await bcrypt.hash(dto.password, 12) },
    });
    await this.createEmailVerificationToken(user.id);
    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email.toLowerCase(), deletedAt: null } });
    if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
      throw new UnauthorizedException('Account is not active');
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const existing = await this.findValidRefreshToken(refreshToken);
    const replacement = this.generateToken();
    const replacementDigest = this.digest(replacement);
    const accessToken = await this.jwt.signAsync({ sub: existing.user.id, email: existing.user.email, role: existing.user.role });
    const created = await this.prisma.refreshToken.create({
      data: {
        userId: existing.userId,
        sessionId: existing.sessionId,
        familyId: existing.familyId,
        tokenHash: await bcrypt.hash(replacement, 12),
        tokenDigest: replacementDigest,
        expiresAt: existing.expiresAt,
      },
    });
    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedById: created.id },
    });
    return { accessToken, refreshToken: replacement };
  }

  async logout(refreshToken: string) {
    const token = await this.prisma.refreshToken.findUnique({ where: { tokenDigest: this.digest(refreshToken) } });
    if (token) {
      await this.prisma.$transaction([
        this.prisma.refreshToken.update({ where: { id: token.id }, data: { revokedAt: new Date() } }),
        this.prisma.session.update({ where: { id: token.sessionId }, data: { revokedAt: new Date(), status: 'REVOKED' } }),
      ]);
    }
    return { success: true };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email: email.toLowerCase(), deletedAt: null } });
    if (user) {
      const token = this.generateToken();
      const ttl = this.config.get<number>('auth.passwordResetTtlSeconds') ?? 3600;
      await this.redis.raw.set(`auth:password-reset:${token}`, user.id, 'EX', ttl);
      await this.prisma.notification.create({
        data: {
          userId: user.id,
          type: 'PASSWORD_RESET',
          title: 'Password reset requested',
          body: 'Use the password reset link sent to your email to finish resetting your password.',
          data: { tokenCreated: true },
        },
      });
    }
    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const key = `auth:password-reset:${dto.token}`;
    const userId = await this.redis.raw.get(key);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(dto.password, 12) } }),
      this.prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date(), status: 'REVOKED' } }),
      this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    await this.redis.raw.del(key);
    return { success: true };
  }

  async verifyEmail(token: string) {
    const key = `auth:email-verification:${token}`;
    const userId = await this.redis.raw.get(key);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired email verification token');
    }
    await this.prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
    await this.redis.raw.del(key);
    return { success: true };
  }

  async googleLogin(profile: GoogleOAuthProfileDto): Promise<AuthTokens> {
    const email = profile.email.toLowerCase();
    const user = await this.prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: profile.name,
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
        emailVerifiedAt: new Date(),
      },
      update: {
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(),
      },
    });
    return this.issueTokens(user);
  }

  private async issueTokens(user: Pick<User, 'id' | 'email' | 'role'>): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = this.generateToken();
    const refreshTokenDays = this.config.get<number>('auth.refreshTokenDays') ?? 30;
    const expiresAt = new Date(Date.now() + refreshTokenDays * 86_400_000);
    const session = await this.prisma.session.create({ data: { userId: user.id, expiresAt } });
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        tokenDigest: this.digest(refreshToken),
        familyId: randomUUID(),
        expiresAt,
      },
    });
    return { accessToken, refreshToken };
  }

  private async findValidRefreshToken(refreshToken: string) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenDigest: this.digest(refreshToken) },
      include: { user: true },
    });
    if (!token || token.revokedAt || token.deletedAt || token.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (!(await bcrypt.compare(refreshToken, token.tokenHash))) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return token;
  }

  private async createEmailVerificationToken(userId: string) {
    const token = this.generateToken();
    const ttl = this.config.get<number>('auth.emailVerificationTtlSeconds') ?? 86_400;
    await this.redis.raw.set(`auth:email-verification:${token}`, userId, 'EX', ttl);
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'EMAIL_VERIFICATION',
        title: 'Verify your NovaMeet email',
        body: 'Use the verification link sent to your email to activate all account features.',
        data: { tokenCreated: true },
      },
    });
  }

  private generateToken() {
    return randomBytes(48).toString('base64url');
  }

  private digest(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
