# NovaMeet Backend Foundation

## Folder structure

```text
src/
  main.ts                         # Nest application bootstrap, validation, CORS, Helmet, Swagger
  app.module.ts                   # Root module wiring config, logger, Prisma, Redis, throttling, features
  config/                         # Environment validation and typed configuration factory
  logger/                         # Application logger module/service
  prisma/                         # Prisma module/service for PostgreSQL access
  redis/                          # Redis module/service and injection token
  common/
    filters/                      # RFC7807-style error handling
    interceptors/                 # HTTP request logging
    middleware/                   # Request correlation IDs
    pipes/                        # Global validation pipe factory
    types/                        # Shared backend-only types
```

The foundation is intentionally small and production-oriented: configuration is global, Prisma and Redis are singleton modules, request IDs are emitted on every response, validation is strict by default, and unhandled exceptions are converted to `application/problem+json` responses.
