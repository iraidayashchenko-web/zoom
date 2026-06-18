import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinRoomPayload, LeaveRoomPayload, PeerSignalPayload, RoomPayload, SignalingParticipant, UserControlPayload } from './dto/signaling.dto.js';
import { SIGNALING_EVENTS } from './signaling.events.js';

@WebSocketGateway({ namespace: '/meetings', cors: { origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'], credentials: true } })
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(SignalingGateway.name);
  private readonly participantsBySocket = new Map<string, SignalingParticipant>();
  private readonly socketsByRoom = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const participant = this.participantsBySocket.get(client.id);
    if (participant) {
      this.removeParticipant(client, participant.roomId, 'disconnect');
    }
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage(SIGNALING_EVENTS.JOIN_ROOM)
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: JoinRoomPayload) {
    this.assertRoomPayload(payload);
    const roomSockets = this.socketsByRoom.get(payload.roomId) ?? new Set<string>();
    const participant: SignalingParticipant = {
      socketId: client.id,
      userId: payload.userId,
      displayName: payload.displayName,
      roomId: payload.roomId,
      isHost: roomSockets.size === 0,
      muted: false,
      screenSharing: false,
      handRaised: false,
      joinedAt: new Date().toISOString(),
    };

    await client.join(payload.roomId);
    roomSockets.add(client.id);
    this.socketsByRoom.set(payload.roomId, roomSockets);
    this.participantsBySocket.set(client.id, participant);
    client.data.roomId = payload.roomId;

    client.to(payload.roomId).emit(SIGNALING_EVENTS.PARTICIPANT_JOINED, participant);
    return { ok: true, participant, participants: this.getRoomParticipants(payload.roomId) };
  }

  @SubscribeMessage(SIGNALING_EVENTS.LEAVE_ROOM)
  async leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: LeaveRoomPayload) {
    this.assertRoomPayload(payload);
    await this.removeParticipant(client, payload.roomId, 'leave');
    return { ok: true };
  }

  @SubscribeMessage(SIGNALING_EVENTS.OFFER)
  offer(@ConnectedSocket() client: Socket, @MessageBody() payload: PeerSignalPayload) {
    this.forwardPeerSignal(client, SIGNALING_EVENTS.OFFER, payload);
    return { ok: true };
  }

  @SubscribeMessage(SIGNALING_EVENTS.ANSWER)
  answer(@ConnectedSocket() client: Socket, @MessageBody() payload: PeerSignalPayload) {
    this.forwardPeerSignal(client, SIGNALING_EVENTS.ANSWER, payload);
    return { ok: true };
  }

  @SubscribeMessage(SIGNALING_EVENTS.ICE_CANDIDATE)
  iceCandidate(@ConnectedSocket() client: Socket, @MessageBody() payload: PeerSignalPayload) {
    this.forwardPeerSignal(client, SIGNALING_EVENTS.ICE_CANDIDATE, payload);
    return { ok: true };
  }

  @SubscribeMessage(SIGNALING_EVENTS.SCREEN_SHARE_START)
  screenShareStart(@ConnectedSocket() client: Socket, @MessageBody() payload: RoomPayload) {
    const participant = this.requireParticipant(client, payload.roomId);
    participant.screenSharing = true;
    this.server.to(payload.roomId).emit(SIGNALING_EVENTS.SCREEN_SHARE_START, { socketId: client.id, userId: participant.userId });
    return { ok: true };
  }

  @SubscribeMessage(SIGNALING_EVENTS.SCREEN_SHARE_STOP)
  screenShareStop(@ConnectedSocket() client: Socket, @MessageBody() payload: RoomPayload) {
    const participant = this.requireParticipant(client, payload.roomId);
    participant.screenSharing = false;
    this.server.to(payload.roomId).emit(SIGNALING_EVENTS.SCREEN_SHARE_STOP, { socketId: client.id, userId: participant.userId });
    return { ok: true };
  }

  @SubscribeMessage(SIGNALING_EVENTS.MUTE_USER)
  muteUser(@ConnectedSocket() client: Socket, @MessageBody() payload: UserControlPayload) {
    this.requireHost(client, payload.roomId);
    const target = this.requireTarget(payload.roomId, payload.targetSocketId);
    target.muted = true;
    this.server.to(payload.roomId).emit(SIGNALING_EVENTS.PARTICIPANT_MUTED, { targetSocketId: payload.targetSocketId, mutedBy: client.id });
    return { ok: true };
  }

  @SubscribeMessage(SIGNALING_EVENTS.KICK_USER)
  kickUser(@ConnectedSocket() client: Socket, @MessageBody() payload: UserControlPayload) {
    this.requireHost(client, payload.roomId);
    this.requireTarget(payload.roomId, payload.targetSocketId);
    this.server.to(payload.targetSocketId).emit(SIGNALING_EVENTS.PARTICIPANT_KICKED, { roomId: payload.roomId, reason: payload.reason ?? 'Removed by host' });
    client.nsp.sockets.get(payload.targetSocketId)?.leave(payload.roomId);
    this.removeParticipantBySocketId(payload.targetSocketId, payload.roomId, 'kick');
    return { ok: true };
  }

  @SubscribeMessage(SIGNALING_EVENTS.RAISE_HAND)
  raiseHand(@ConnectedSocket() client: Socket, @MessageBody() payload: RoomPayload) {
    const participant = this.requireParticipant(client, payload.roomId);
    participant.handRaised = true;
    this.server.to(payload.roomId).emit(SIGNALING_EVENTS.HAND_RAISED, { socketId: client.id, userId: participant.userId, displayName: participant.displayName });
    return { ok: true };
  }

  private forwardPeerSignal(client: Socket, event: string, payload: PeerSignalPayload) {
    this.requireParticipant(client, payload.roomId);
    this.requireTarget(payload.roomId, payload.targetSocketId);
    this.server.to(payload.targetSocketId).emit(event, {
      roomId: payload.roomId,
      fromSocketId: client.id,
      description: payload.description,
      candidate: payload.candidate,
    });
  }

  private async removeParticipant(client: Socket, roomId: string, reason: string) {
    await client.leave(roomId);
    this.removeParticipantBySocketId(client.id, roomId, reason);
  }

  private removeParticipantBySocketId(socketId: string, roomId: string, reason: string) {
    const participant = this.participantsBySocket.get(socketId);
    this.participantsBySocket.delete(socketId);
    const roomSockets = this.socketsByRoom.get(roomId);
    roomSockets?.delete(socketId);
    if (roomSockets?.size === 0) {
      this.socketsByRoom.delete(roomId);
    }
    this.server.to(roomId).emit(SIGNALING_EVENTS.PARTICIPANT_LEFT, { socketId, userId: participant?.userId, reason });
  }

  private requireParticipant(client: Socket, roomId: string) {
    const participant = this.participantsBySocket.get(client.id);
    if (!participant || participant.roomId !== roomId) {
      client.emit(SIGNALING_EVENTS.SIGNALING_ERROR, { message: 'Socket has not joined this room' });
      throw new WsException('Socket has not joined this room');
    }
    return participant;
  }

  private requireHost(client: Socket, roomId: string) {
    const participant = this.requireParticipant(client, roomId);
    if (!participant.isHost) {
      client.emit(SIGNALING_EVENTS.SIGNALING_ERROR, { message: 'Host permission required' });
      throw new WsException('Host permission required');
    }
    return participant;
  }

  private requireTarget(roomId: string, targetSocketId: string) {
    const participant = this.participantsBySocket.get(targetSocketId);
    if (!participant || participant.roomId !== roomId) {
      throw new WsException('Target socket is not in this room');
    }
    return participant;
  }

  private getRoomParticipants(roomId: string) {
    return [...(this.socketsByRoom.get(roomId) ?? [])]
      .map((socketId) => this.participantsBySocket.get(socketId))
      .filter((participant): participant is SignalingParticipant => Boolean(participant));
  }

  private assertRoomPayload(payload: { roomId?: string; displayName?: string }) {
    if (!payload?.roomId) {
      throw new WsException('roomId is required');
    }
    if ('displayName' in payload && !payload.displayName) {
      throw new WsException('displayName is required');
    }
  }
}
