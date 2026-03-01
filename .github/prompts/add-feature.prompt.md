# Add Feature

Add a new feature to the application following these steps:

1. **Plan**: Identify which packages, pages, and API routes are needed
2. **Schema**: If DB changes needed, update `packages/db/schema/` and run `pnpm db:generate`
3. **Validation**: Add Zod schemas to `packages/validation/schemas/`
4. **Repository**: Add/update repository in `packages/db/repositories/`
5. **API**: Add oRPC procedure in `apps/web/server/orpc/routers/` and run `pnpm generate:openapi`
6. **UI**: Create components in `packages/ui/` or `apps/web/components/`
7. **Page**: Create page in `apps/web/pages/`
8. **Tests**: Write unit + integration tests
9. **Verify**: Run `pnpm test && pnpm typecheck && pnpm lint`
