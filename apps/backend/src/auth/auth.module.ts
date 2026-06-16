import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'dev-secret-change-me', signOptions: { expiresIn: '15m' } })], controllers: [AuthController], providers: [AuthService, PrismaService], exports: [AuthService] })
export class AuthModule {}
