FROM node:22-alpine AS base
RUN corepack enable pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json packages/db/
COPY packages/queue/package.json packages/queue/
COPY packages/shared/package.json packages/shared/
COPY packages/storage/package.json packages/storage/
COPY packages/email/package.json packages/email/
COPY services/worker/package.json services/worker/
RUN pnpm install --frozen-lockfile --filter @ripple/worker...

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @ripple/worker... build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/services/worker/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
