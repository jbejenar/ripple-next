---
applyTo: 'apps/web/server/**'
---

# API Instructions

## API Boundary (ADR-021)

- **oRPC** is the canonical API framework (replacing tRPC — migration in RN-046)
- OpenAPI 3.1.1 spec is a first-class build product: `pnpm generate:openapi`
- CI validates contract drift: `pnpm check:api-contract`
- Every route must declare `visibility: 'public'` or `visibility: 'internal'`
- Public routes are versioned (`/v1/`), breaking-change gated, and published to portal
- Internal routes are not published; can change freely

## Current State (Pre-Migration)

- tRPC procedures are in `apps/web/server/trpc/routers/` (migration pending)
- REST endpoints are in `apps/web/server/api/` (file-based routing)
- Auth routes are in `apps/web/server/routes/auth/` (remain as H3 handlers)

## Conventions

- Use `publicProcedure` for unauthenticated endpoints
- Use `protectedProcedure` for authenticated endpoints
- Validate all inputs with Zod schemas from `@ripple/validation`
- Use repository pattern from `@ripple/db` for data access
- Never import Drizzle directly in API routes — use repositories
- No business logic in the transport layer — delegate to repositories/services
- Server middleware in `apps/web/server/middleware/`
