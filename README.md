# NovaMeet

> Phase 1 architecture is documented in `docs/phase-1-architecture.md`. No additional implementation code is introduced by the Phase 1 revision.
> Phase 2 project structure is documented in `docs/phase-2-project-structure.md`. This phase is structure-only and does not add implementation logic.


NovaMeet is a deployable SaaS video conferencing monorepo scaffold for a Zoom-style platform with Next.js, NestJS, Prisma, PostgreSQL, Redis, mediasoup, Coturn, S3-compatible storage, Kubernetes, Helm, and observability assets.

## Phases

1. Architecture: see `docs/architecture.md`.
2. Database: see `apps/backend/prisma/schema.prisma`.
3. Backend: see `apps/backend/src`.
4. Frontend: see `apps/frontend/src`.
5. WebRTC: see `apps/backend/src/signaling` and `apps/backend/src/media`.
6. Infrastructure: see `infra`.
7. Testing: see package scripts and `tests/load`.
8. Production deployment: see `.github/workflows/ci.yml` and Helm chart.

## Local development

```bash
corepack enable
pnpm install
pnpm dev
```
