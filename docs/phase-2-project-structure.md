# NovaMeet — Phase 2 Project Structure

This document defines the complete NovaMeet monorepo structure based on the approved Phase 1 architecture. It is intentionally structure-only: no implementation logic is introduced in this phase.

## Workspace standard

- Package manager: `pnpm`
- Workspace file: `pnpm-workspace.yaml`
- Root orchestration: root `package.json` plus `turbo.json`
- Deployable apps: `apps/backend` and `apps/frontend`
- Shared packages: `packages/shared`, `packages/ui`, `packages/types`
- Infrastructure: `infra/docker`, `infra/kubernetes`, `infra/monitoring`

## Complete folder and file tree

```text
novameet/
├── .editorconfig
├── .env.example
├── .eslintignore
├── .eslintrc.cjs
├── .gitignore
├── .npmrc
├── .prettierignore
├── .prettierrc
├── README.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
│
├── apps/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── README.md
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── tsconfig.build.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   │
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   │       └── .gitkeep
│   │   │
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── app.config.ts
│   │   │   │   ├── auth.config.ts
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   ├── s3.config.ts
│   │   │   │   └── validation.ts
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   ├── public.decorator.ts
│   │   │   │   │   └── roles.decorator.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   ├── meeting-role.guard.ts
│   │   │   │   │   └── roles.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── audit-log.interceptor.ts
│   │   │   │   │   ├── request-id.interceptor.ts
│   │   │   │   │   └── response-envelope.interceptor.ts
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── csrf.middleware.ts
│   │   │   │   │   └── security-headers.middleware.ts
│   │   │   │   ├── pipes/
│   │   │   │   │   └── zod-validation.pipe.ts
│   │   │   │   └── types/
│   │   │   │       ├── request-context.ts
│   │   │   │       └── token-payload.ts
│   │   │   │
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.module.ts
│   │   │   │   └── prisma.service.ts
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── forgot-password.dto.ts
│   │   │   │   │   ├── google-oauth.dto.ts
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   │   ├── register.dto.ts
│   │   │   │   │   ├── reset-password.dto.ts
│   │   │   │   │   └── verify-email.dto.ts
│   │   │   │   └── strategies/
│   │   │   │       ├── google.strategy.ts
│   │   │   │       └── jwt.strategy.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── update-profile.dto.ts
│   │   │   │       └── update-settings.dto.ts
│   │   │   │
│   │   │   ├── meetings/
│   │   │   │   ├── meetings.controller.ts
│   │   │   │   ├── meetings.module.ts
│   │   │   │   ├── meetings.service.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-meeting.dto.ts
│   │   │   │   │   ├── join-meeting.dto.ts
│   │   │   │   │   ├── meeting-controls.dto.ts
│   │   │   │   │   └── update-meeting.dto.ts
│   │   │   │   └── policies/
│   │   │   │       └── meeting-policy.ts
│   │   │   │
│   │   │   ├── participants/
│   │   │   │   ├── participants.controller.ts
│   │   │   │   ├── participants.module.ts
│   │   │   │   ├── participants.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── update-participant.dto.ts
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   ├── chat.controller.ts
│   │   │   │   ├── chat.module.ts
│   │   │   │   ├── chat.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-message.dto.ts
│   │   │   │       ├── list-messages.dto.ts
│   │   │   │       └── react-message.dto.ts
│   │   │   │
│   │   │   ├── recordings/
│   │   │   │   ├── recordings.controller.ts
│   │   │   │   ├── recordings.module.ts
│   │   │   │   ├── recordings.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── start-recording.dto.ts
│   │   │   │       └── stop-recording.dto.ts
│   │   │   │
│   │   │   ├── polls/
│   │   │   │   ├── polls.controller.ts
│   │   │   │   ├── polls.module.ts
│   │   │   │   ├── polls.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-poll.dto.ts
│   │   │   │       └── vote-poll.dto.ts
│   │   │   │
│   │   │   ├── whiteboard/
│   │   │   │   ├── whiteboard.controller.ts
│   │   │   │   ├── whiteboard.module.ts
│   │   │   │   ├── whiteboard.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── whiteboard-event.dto.ts
│   │   │   │
│   │   │   ├── signaling/
│   │   │   │   ├── signaling.gateway.ts
│   │   │   │   ├── signaling.module.ts
│   │   │   │   └── dto/
│   │   │   │       ├── client-events.dto.ts
│   │   │   │       └── server-events.dto.ts
│   │   │   │
│   │   │   ├── media/
│   │   │   │   ├── media.module.ts
│   │   │   │   ├── media-router.service.ts
│   │   │   │   ├── mediasoup.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-transport.dto.ts
│   │   │   │       ├── produce.dto.ts
│   │   │   │       └── consume.dto.ts
│   │   │   │
│   │   │   ├── storage/
│   │   │   │   ├── storage.module.ts
│   │   │   │   ├── s3.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── signed-url.dto.ts
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── analytics.controller.ts
│   │   │   │   ├── analytics.module.ts
│   │   │   │   └── analytics.service.ts
│   │   │   │
│   │   │   ├── audit/
│   │   │   │   ├── audit.module.ts
│   │   │   │   └── audit.service.ts
│   │   │   │
│   │   │   ├── health/
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── health.module.ts
│   │   │   │
│   │   │   └── observability/
│   │   │       ├── logger.service.ts
│   │   │       ├── metrics.controller.ts
│   │   │       └── tracing.ts
│   │   │
│   │   └── test/
│   │       ├── unit/
│   │       │   └── .gitkeep
│   │       ├── integration/
│   │       │   └── .gitkeep
│   │       └── e2e/
│   │           └── .gitkeep
│   │
│   └── frontend/
│       ├── Dockerfile
│       ├── README.md
│       ├── next-env.d.ts
│       ├── next.config.ts
│       ├── package.json
│       ├── postcss.config.js
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       ├── .env.example
│       │
│       ├── public/
│       │   ├── favicon.ico
│       │   ├── logo.svg
│       │   └── robots.txt
│       │
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── page.tsx
│           │   ├── globals.css
│           │   ├── providers.tsx
│           │   ├── auth/
│           │   │   ├── login/
│           │   │   │   └── page.tsx
│           │   │   ├── register/
│           │   │   │   └── page.tsx
│           │   │   ├── forgot-password/
│           │   │   │   └── page.tsx
│           │   │   ├── reset-password/
│           │   │   │   └── page.tsx
│           │   │   └── verify-email/
│           │   │       └── page.tsx
│           │   ├── dashboard/
│           │   │   ├── layout.tsx
│           │   │   ├── page.tsx
│           │   │   ├── meetings/
│           │   │   │   ├── page.tsx
│           │   │   │   └── new/
│           │   │   │       └── page.tsx
│           │   │   ├── recordings/
│           │   │   │   └── page.tsx
│           │   │   ├── analytics/
│           │   │   │   └── page.tsx
│           │   │   └── settings/
│           │   │       └── page.tsx
│           │   ├── meeting/
│           │   │   └── [id]/
│           │   │       └── page.tsx
│           │   ├── recordings/
│           │   │   └── [id]/
│           │   │       └── page.tsx
│           │   └── admin/
│           │       ├── page.tsx
│           │       ├── users/
│           │       │   └── page.tsx
│           │       └── meetings/
│           │           └── page.tsx
│           │
│           ├── components/
│           │   ├── auth/
│           │   │   ├── login-form.tsx
│           │   │   └── register-form.tsx
│           │   ├── dashboard/
│           │   │   ├── meeting-card.tsx
│           │   │   └── schedule-meeting-form.tsx
│           │   ├── meeting/
│           │   │   ├── chat-panel.tsx
│           │   │   ├── control-bar.tsx
│           │   │   ├── participant-grid.tsx
│           │   │   ├── participant-tile.tsx
│           │   │   ├── polls-panel.tsx
│           │   │   ├── recording-indicator.tsx
│           │   │   └── whiteboard-panel.tsx
│           │   ├── recordings/
│           │   │   └── recording-player.tsx
│           │   └── layout/
│           │       ├── app-sidebar.tsx
│           │       └── top-nav.tsx
│           │
│           ├── hooks/
│           │   ├── use-auth.ts
│           │   ├── use-devices.ts
│           │   ├── use-meeting.ts
│           │   ├── use-signaling.ts
│           │   └── use-webrtc.ts
│           │
│           ├── lib/
│           │   ├── api-client.ts
│           │   ├── query-client.ts
│           │   ├── socket.ts
│           │   ├── utils.ts
│           │   └── webrtc.ts
│           │
│           ├── stores/
│           │   ├── auth-store.ts
│           │   ├── meeting-store.ts
│           │   └── ui-store.ts
│           │
│           └── styles/
│               └── theme.css
│
├── packages/
│   ├── shared/
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── constants/
│   │       │   ├── app.ts
│   │       │   ├── roles.ts
│   │       │   └── webrtc.ts
│   │       ├── errors/
│   │       │   ├── error-codes.ts
│   │       │   └── problem-details.ts
│   │       ├── validation/
│   │       │   ├── auth.schema.ts
│   │       │   ├── meeting.schema.ts
│   │       │   └── upload.schema.ts
│   │       └── utils/
│   │           ├── date.ts
│   │           ├── ids.ts
│   │           └── redaction.ts
│   │
│   ├── ui/
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── components/
│   │       │   ├── avatar.tsx
│   │       │   ├── badge.tsx
│   │       │   ├── button.tsx
│   │       │   ├── card.tsx
│   │       │   ├── dialog.tsx
│   │       │   ├── dropdown-menu.tsx
│   │       │   ├── input.tsx
│   │       │   ├── label.tsx
│   │       │   ├── select.tsx
│   │       │   ├── separator.tsx
│   │       │   ├── sheet.tsx
│   │       │   ├── switch.tsx
│   │       │   ├── tabs.tsx
│   │       │   ├── textarea.tsx
│   │       │   └── toast.tsx
│   │       ├── hooks/
│   │       │   └── use-toast.ts
│   │       └── lib/
│   │           └── cn.ts
│   │
│   └── types/
│       ├── README.md
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── api/
│           │   ├── auth.ts
│           │   ├── chat.ts
│           │   ├── meetings.ts
│           │   ├── recordings.ts
│           │   └── users.ts
│           ├── domain/
│           │   ├── audit.ts
│           │   ├── meeting.ts
│           │   ├── participant.ts
│           │   ├── poll.ts
│           │   ├── recording.ts
│           │   └── user.ts
│           └── realtime/
│               ├── chat-events.ts
│               ├── meeting-events.ts
│               ├── signaling-events.ts
│               └── whiteboard-events.ts
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.override.yml
│   │   ├── backend.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   ├── media-worker.Dockerfile
│   │   ├── coturn/
│   │   │   └── turnserver.conf
│   │   ├── postgres/
│   │   │   └── init.sql
│   │   └── minio/
│   │       └── buckets.sh
│   │
│   ├── kubernetes/
│   │   ├── namespaces.yaml
│   │   ├── secrets.example.yaml
│   │   ├── configmaps.yaml
│   │   ├── ingress.yaml
│   │   ├── network-policies.yaml
│   │   ├── backend/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── hpa.yaml
│   │   │   └── pdb.yaml
│   │   ├── frontend/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── hpa.yaml
│   │   │   └── pdb.yaml
│   │   ├── realtime/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── hpa.yaml
│   │   │   └── pdb.yaml
│   │   ├── media-worker/
│   │   │   ├── daemonset.yaml
│   │   │   ├── service.yaml
│   │   │   └── pdb.yaml
│   │   ├── coturn/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── workers/
│   │   │   ├── deployment.yaml
│   │   │   └── hpa.yaml
│   │   └── jobs/
│   │       └── prisma-migrate.job.yaml
│   │
│   └── monitoring/
│       ├── prometheus/
│       │   ├── prometheus.yml
│       │   └── rules/
│       │       ├── api-alerts.yml
│       │       ├── media-alerts.yml
│       │       └── redis-alerts.yml
│       ├── grafana/
│       │   ├── dashboards/
│       │   │   ├── api-dashboard.json
│       │   │   ├── media-dashboard.json
│       │   │   └── realtime-dashboard.json
│       │   └── provisioning/
│       │       ├── dashboards.yml
│       │       └── datasources.yml
│       ├── loki/
│       │   └── loki.yml
│       └── otel/
│           └── collector-config.yml
│
├── docs/
│   ├── architecture.md
│   ├── phase-1-architecture.md
│   ├── phase-2-project-structure.md
│   ├── api.md
│   ├── openapi.yaml
│   └── adr/
│       ├── 0001-monorepo.md
│       ├── 0002-mediasoup-sfu.md
│       └── 0003-redis-coordination.md
│
├── tests/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── meeting.spec.ts
│   │   └── recording.spec.ts
│   ├── integration/
│   │   ├── auth.integration-spec.ts
│   │   ├── meetings.integration-spec.ts
│   │   └── signaling.integration-spec.ts
│   └── load/
│       ├── api-load.js
│       ├── meeting-load.js
│       └── websocket-load.js
│
└── .github/
    └── workflows/
        ├── ci.yml
        ├── docker-build.yml
        ├── helm-lint.yml
        └── security-scan.yml
```

## Required root files

| File | Purpose |
| --- | --- |
| `.editorconfig` | Editor formatting baseline across IDEs. |
| `.env.example` | Root example environment variables for local orchestration. |
| `.eslintignore` | Files excluded from linting. |
| `.eslintrc.cjs` | Shared lint configuration. |
| `.gitignore` | Git ignore rules for dependencies, builds, secrets, and local state. |
| `.npmrc` | pnpm and registry behavior. |
| `.prettierignore` | Files excluded from formatting. |
| `.prettierrc` | Shared formatting rules. |
| `README.md` | Project overview and contributor entry point. |
| `package.json` | Root scripts and workspace-level dev dependencies. |
| `pnpm-lock.yaml` | Locked dependency graph. |
| `pnpm-workspace.yaml` | pnpm workspace package globs. |
| `turbo.json` | Task orchestration graph. |
| `tsconfig.base.json` | Shared TypeScript compiler baseline. |

## Required app boundaries

| Path | Boundary |
| --- | --- |
| `apps/backend` | NestJS API, persistence, auth, RBAC, durable meeting data, admin APIs. |
| `apps/frontend` | Next.js web client, dashboard, meeting UI, recording playback. |

## Required package boundaries

| Path | Boundary |
| --- | --- |
| `packages/shared` | Runtime-safe shared constants, validation schemas, utilities, error contracts. |
| `packages/ui` | Reusable React UI primitives and shadcn/ui-compatible components. |
| `packages/types` | Cross-service TypeScript contracts for REST DTOs, domain models, and realtime events. |

## Required infrastructure boundaries

| Path | Boundary |
| --- | --- |
| `infra/docker` | Local development runtime using Docker Compose and service-specific Dockerfiles. |
| `infra/kubernetes` | Raw production Kubernetes manifests grouped by workload. |
| `infra/monitoring` | Prometheus, Grafana, Loki, and OpenTelemetry configuration. |

## Phase 2 rule

This phase defines the complete file and folder layout only. Implementation bodies, business logic, schemas, controllers, UI rendering, deployment manifests, tests, and runtime code are deferred to later phases.
