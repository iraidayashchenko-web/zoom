import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto } from './auth.dto.js';
@ApiTags('auth')
@Controller('auth')
export class AuthController { constructor(private readonly auth: AuthService) {} @Post('register') register(@Body() dto: RegisterDto) { return this.auth.register(dto); } @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto); } }
