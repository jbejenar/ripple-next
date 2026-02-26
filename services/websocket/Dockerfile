FROM node:22-alpine AS base
RUN corepack enable pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY services/websocket/package.json services/websocket/
RUN pnpm install --frozen-lockfile --filter @ripple/websocket...

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @ripple/websocket... build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/services/websocket/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3001/health || exit 1
CMD ["node", "dist/server.js"]
