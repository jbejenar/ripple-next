# @ripple-next/validation

Zod-based validation schemas for domain models and environment variables.

## Install

```bash
pnpm add @ripple-next/validation
```

## User Schemas

```typescript
import { createUserSchema, updateUserSchema, loginSchema } from '@ripple-next/validation'
import type { CreateUserInput, LoginInput } from '@ripple-next/validation'

const result = createUserSchema.safeParse({
  email: 'user@example.com',
  name: 'Jane Doe',
  password: 'secure-password',
})
```

## Project Schemas

```typescript
import { createProjectSchema, updateProjectSchema } from '@ripple-next/validation'
import type { CreateProjectInput, UpdateProjectInput } from '@ripple-next/validation'
```

## Environment Validation

```typescript
import { validateEnv } from '@ripple-next/validation'

const result = validateEnv(process.env)
if (!result.valid) {
  console.error(result.issues) // [{ field: 'DATABASE_URL', message: 'Required' }]
  process.exit(1)
}
```

Run standalone:

```bash
pnpm validate:env
```

## CMS Content Schemas

Zod validators for the full Drupal/Tide content model:

```typescript
import { cmsPageSchema, cmsSearchQuerySchema, pageSectionSchema } from '@ripple-next/validation'

const page = cmsPageSchema.parse(rawPageData)
```

Covers: pages, taxonomies, menus, routes, search, all 8 paragraph/section types (accordion, card, timeline, CTA, key-dates, image, video, wysiwyg).

## Related

- [ADR-012: Env Schema Validation](../../docs/adr/012-env-schema-validation.md)
