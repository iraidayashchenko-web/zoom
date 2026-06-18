export interface JoinRoomPayload {
  roomId: string;
  userId?: string;
  displayName: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface PeerSignalPayload {
  roomId: string;
  targetSocketId: string;
  description?: unknown;
  candidate?: unknown;
}

export interface RoomPayload {
  roomId: string;
}

export interface UserControlPayload {
  roomId: string;
  targetSocketId: string;
  reason?: string;
}

export interface SignalingParticipant {
  socketId: string;
  userId?: string;
  displayName: string;
  roomId: string;
  isHost: boolean;
  muted: boolean;
  screenSharing: boolean;
  handRaised: boolean;
  joinedAt: string;
}
