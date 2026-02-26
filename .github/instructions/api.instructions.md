---
applyTo: "apps/web/server/**"
---
# API Instructions
- tRPC procedures go in `apps/web/server/trpc/routers/`
- REST endpoints go in `apps/web/server/api/` (file-based routing)
- Use `publicProcedure` for unauthenticated endpoints
- Use `protectedProcedure` for authenticated endpoints
- Validate all inputs with Zod schemas from `@ripple/validation`
- Use repository pattern from `@ripple/db` for data access
- Never import Drizzle directly in API routes — use repositories
- Error responses use tRPC error codes (UNAUTHORIZED, NOT_FOUND, etc.)
- Server middleware in `apps/web/server/middleware/`
