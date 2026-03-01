# @ripple-next/db

Database layer using Drizzle ORM with PostgreSQL. Provides schema definitions, repository pattern, and migration tooling.

## Install

```bash
pnpm add @ripple-next/db
```

## Schema

| Table | Description |
|-------|-------------|
| `users` | Application users |
| `projects` | User projects |
| `sessions` | Authentication sessions |
| `auditLog` | Audit trail |

## Usage

```typescript
import { getDatabase, UserRepository, ProjectRepository, SessionRepository } from '@ripple-next/db'

const db = getDatabase(process.env.DATABASE_URL)

const userRepo = new UserRepository(db)
const user = await userRepo.findById('user-id')
const users = await userRepo.findAll({ limit: 20, offset: 0 })
```

## Migrations

```bash
pnpm --filter @ripple-next/db db:generate   # Generate migration from schema changes
pnpm --filter @ripple-next/db db:migrate    # Run pending migrations
pnpm --filter @ripple-next/db db:seed       # Seed development data
```

## Integration Tests

Repository tests run against a real PostgreSQL 17 container via Testcontainers:

```bash
pnpm --filter @ripple-next/db test
```

Tests validate CRUD operations, unique constraints, and foreign key relationships.

## Related

- [Architecture: Repository Pattern](../../docs/architecture.md)
- [Provider pattern](../../docs/provider-pattern.md)
