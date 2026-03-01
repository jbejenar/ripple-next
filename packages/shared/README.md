# @ripple-next/shared

Shared types, utilities, and constants used across frontend and backend packages.

## Install

```bash
pnpm add @ripple-next/shared
```

## Types

```typescript
import type { PaginatedResult, ApiResponse, SortOrder, FilterOptions } from '@ripple-next/shared'

const result: PaginatedResult<User> = {
  data: [...],
  total: 100,
  page: 1,
  pageSize: 20,
}
```

## Utilities

```typescript
import { slugify, truncate, formatDate, objectKeys, sleep } from '@ripple-next/shared'

slugify('Hello World!')         // 'hello-world'
truncate('Long text...', 10)    // 'Long te...'
formatDate(new Date())          // '1 Mar 2026' (Australian locale)
```

## Constants

```typescript
import {
  APP_NAME,              // 'Ripple Next'
  DEFAULT_PAGE_SIZE,     // 20
  MAX_PAGE_SIZE,         // 100
  SESSION_COOKIE_NAME,   // 'ripple-session'
  MAX_UPLOAD_SIZE,       // 10485760 (10MB)
  SUPPORTED_IMAGE_TYPES, // ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
} from '@ripple-next/shared'
```
