FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages packages
RUN pnpm install --filter @novameet/backend... --frozen-lockfile=false
FROM deps AS build
COPY apps/backend apps/backend
RUN pnpm --filter @novameet/backend build
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/backend/dist dist
COPY --from=build /app/node_modules node_modules
CMD ["node", "dist/main.js"]
