# ADR-002: Drizzle ORM over Prisma

## Status
Accepted

## Context
Choosing between Drizzle ORM and Prisma for database access.

## Decision
Use Drizzle ORM with PostgreSQL.

## Rationale
- Schemas are TypeScript (not a custom DSL) — agents read/write them natively
- Migrations are SQL files — agents can inspect and modify them
- Relational queries are typed — agents get type inference
- No code generation step — faster feedback loop
- SQL-like API is closer to the metal — agents trained on SQL perform better
