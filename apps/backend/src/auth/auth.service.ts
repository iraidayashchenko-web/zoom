import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto, RegisterDto } from './auth.dto.js';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  async register(dto: RegisterDto) { if (await this.prisma.user.findUnique({ where: { email: dto.email } })) throw new ConflictException('Email already registered'); const user = await this.prisma.user.create({ data: { email: dto.email.toLowerCase(), name: dto.name, passwordHash: await bcrypt.hash(dto.password, 12) } }); return this.issueTokens(user.id, user.email, user.role); }
  async login(dto: LoginDto) { const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } }); if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid credentials'); return this.issueTokens(user.id, user.email, user.role); }
  private async issueTokens(sub: string, email: string, role: string) { const accessToken = await this.jwt.signAsync({ sub, email, role }); const refreshToken = crypto.randomUUID() + crypto.randomUUID(); await this.prisma.session.create({ data: { userId: sub, refreshTokenHash: await bcrypt.hash(refreshToken, 12), expiresAt: new Date(Date.now() + 30 * 86400_000) } }); return { accessToken, refreshToken }; }
}
