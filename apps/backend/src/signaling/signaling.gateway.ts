import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ namespace: '/meetings', cors: { origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'], credentials: true } })
export class SignalingGateway {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(SignalingGateway.name);
  @SubscribeMessage('meeting:join') join(@ConnectedSocket() client: Socket, @MessageBody() body: { meetingId: string; displayName: string }) { void client.join(body.meetingId); client.to(body.meetingId).emit('meeting:participant-joined', { socketId: client.id, displayName: body.displayName }); return { ok: true, socketId: client.id }; }
  @SubscribeMessage('chat:send') chat(@ConnectedSocket() client: Socket, @MessageBody() body: { meetingId: string; body: string; recipientId?: string }) { const message = { id: crypto.randomUUID(), senderId: client.id, createdAt: new Date().toISOString(), ...body }; this.server.to(body.meetingId).emit('chat:message', message); return message; }
  @SubscribeMessage('media:create-transport') media(@MessageBody() body: { meetingId: string; direction: 'send' | 'recv' }) { this.logger.log(`transport requested for ${body.meetingId}`); return { id: crypto.randomUUID(), iceParameters: {}, iceCandidates: [], dtlsParameters: {}, direction: body.direction }; }
}
