import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto, RegisterDto } from './auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Email already registered');
    }
    const user = await this.prisma.user.create({
      data: { email, name: dto.name, passwordHash: await bcrypt.hash(dto.password, 12) },
    });
    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id, user.email, user.role);
  }

  private async issueTokens(sub: string, email: string, role: string) {
    const accessToken = await this.jwt.signAsync({ sub, email, role });
    const refreshToken = crypto.randomUUID() + crypto.randomUUID();
    const refreshTokenDays = this.config.get<number>('auth.refreshTokenDays') ?? 30;
    const expiresAt = new Date(Date.now() + refreshTokenDays * 86_400_000);
    const session = await this.prisma.session.create({ data: { userId: sub, expiresAt } });
    await this.prisma.refreshToken.create({
      data: {
        userId: sub,
        sessionId: session.id,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        familyId: crypto.randomUUID(),
        expiresAt,
      },
    });
    return { accessToken, refreshToken };
  }
}
