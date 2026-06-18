import { io } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@novameet/types';
export function createMeetingSocket(token?: string) { return io<ServerToClientEvents, ClientToServerEvents>(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/meetings`, { auth: { token }, transports: ['websocket'] }); }
