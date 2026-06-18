import { Module } from '@nestjs/common';
import { SignalingGateway } from './signaling.gateway.js';

@Module({ providers: [SignalingGateway], exports: [SignalingGateway] })
export class SignalingModule {}
