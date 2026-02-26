# Drizzle Migration Skill

## When to use
When you need to create or modify database schemas and generate migrations.

## Steps
1. Edit the schema file in `packages/db/schema/`
2. Export new tables from `packages/db/schema/index.ts`
3. Run `pnpm db:generate` to create the migration SQL file
4. Review the generated SQL in `packages/db/migrations/`
5. Run `pnpm db:migrate` to apply the migration
6. Update the repository in `packages/db/repositories/` if needed
7. Update the seed data in `packages/db/seed.ts` if needed
8. Run `pnpm test` to verify nothing broke

## Schema conventions
- Use `uuid('id').primaryKey().defaultRandom()` for primary keys
- Use `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`
- Use `varchar` with explicit length for strings
- Use `text` for long content
- Use `jsonb` for structured metadata
- Always add `$inferSelect` and `$inferInsert` type exports
