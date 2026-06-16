export type Role = 'GUEST' | 'USER' | 'HOST' | 'ADMIN' | 'SUPER_ADMIN';
export interface AuthUser { id: string; email: string; name: string; role: Role; avatarUrl?: string | null }
export interface MeetingDto { id: string; title: string; startsAt: string; endsAt: string; status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED' }
export interface ChatMessageDto { id: string; meetingId: string; senderId: string; body: string; createdAt: string; recipientId?: string }
export interface ServerToClientEvents { 'meeting:participant-joined': (payload: unknown) => void; 'chat:message': (message: ChatMessageDto) => void; 'poll:results': (payload: unknown) => void; 'media:consumer-created': (payload: unknown) => void; }
export interface ClientToServerEvents { 'meeting:join': (payload: { meetingId: string; displayName: string }) => void; 'chat:send': (payload: { meetingId: string; body: string; recipientId?: string }) => void; 'media:create-transport': (payload: { meetingId: string; direction: 'send' | 'recv' }) => void; }
