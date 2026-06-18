# NovaMeet Architecture

NovaMeet is a production-oriented SaaS video conferencing platform using a monorepo with a Next.js frontend, NestJS backend, shared TypeScript packages, PostgreSQL, Redis, mediasoup SFU workers, Coturn, and S3-compatible object storage.

## Phase 1: Architecture

- **Frontend**: Next.js 15/React 19 app provides marketing, dashboard, meeting room, and recording playback surfaces. Zustand owns local meeting device state; TanStack Query owns server state; Socket.io client carries realtime meeting events.
- **Backend**: NestJS exposes stateless REST APIs and Socket.io gateways. JWT access tokens authorize APIs; refresh tokens are stored hashed in `Session` rows. Redis backs throttling, pub/sub, meeting presence, and Socket.io horizontal scaling.
- **Video**: mediasoup SFU architecture separates signaling from media. API nodes coordinate rooms; media workers create routers/transports/producers/consumers with simulcast and adaptive bitrate.
- **Storage**: S3-compatible buckets store avatars, chat attachments, and recordings. Metadata lives in PostgreSQL.
- **Observability**: OpenTelemetry exports traces/metrics, Prometheus scrapes services, Grafana visualizes dashboards, Loki stores logs, and Sentry captures exceptions.
- **Security**: RBAC, Helmet security headers, CORS allow-listing, DTO validation, rate limiting, CSRF protection for cookie flows, audit logs, and secret injection via Kubernetes Secrets.

## Phase 2: Database

Prisma models cover users, sessions, meetings, settings, participants, messages, attachments, recordings, polls, votes, and audit logs. Indexes optimize high-volume queries by tenant-like access patterns: user, meeting, status, and timestamp.

## Phase 3: Backend

REST endpoints are grouped by bounded contexts: auth, users, meetings, chat, recordings, polls, analytics, and health. Gateways emit canonical WebSocket events documented in `docs/api.md`.

## Phase 4: Frontend

The meeting room bootstraps device preferences, joins signaling, negotiates WebRTC transports, renders participants, chat, polls, and whiteboard controls. Components are composed from shared UI primitives styled with Tailwind and shadcn-compatible class conventions.

## Phase 5: WebRTC

mediasoup workers are horizontally scaled. Each meeting maps to a media router; clients publish camera, microphone, and screen producers with simulcast encodings. Consumers are paused/resumed based on viewport and bandwidth estimation.

## Phase 6: Infrastructure

Docker Compose supports local development. Kubernetes manifests and Helm chart deploy API, web, PostgreSQL, Redis, Coturn, mediasoup, monitoring, ingress, and secrets.

## Phase 7: Testing

Unit tests cover services and stores, integration tests cover REST APIs and Prisma, E2E tests cover meeting join and chat, and k6 validates websocket/API load targets.

## Phase 8: Production Deployment

CI builds, lints, tests, scans, and pushes images. CD applies Helm releases with rolling updates, readiness checks, HPA, PodDisruptionBudgets, and migration jobs.
