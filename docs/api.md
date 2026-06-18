# NovaMeet API

## REST
- `POST /api/v1/auth/register` creates a user and session.
- `POST /api/v1/auth/login` returns JWT and refresh token.
- `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/password-recovery`, and `POST /api/v1/auth/google` are reserved extension points.
- `GET /api/v1/meetings` lists host meetings.
- `POST /api/v1/meetings` creates instant, scheduled, or recurring meetings.

## WebSocket namespace `/meetings`
- `meeting:join` joins a room.
- `chat:send` broadcasts public or private chat messages.
- `media:create-transport` requests mediasoup WebRTC transports.
- `poll:vote`, `whiteboard:draw`, and host control events are part of the stable event catalog for implementation expansion.

## Error strategy
All HTTP errors return RFC7807-compatible JSON with `statusCode`, `error`, `message`, `requestId`, and `timestamp`.
