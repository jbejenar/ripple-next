# Data Model

## PostgreSQL Schema

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| password_hash | VARCHAR(255) | |
| role | VARCHAR(50) | NOT NULL, default: 'user' |
| is_active | BOOLEAN | NOT NULL, default: true |
| created_at | TIMESTAMPTZ | NOT NULL, default: now() |
| updated_at | TIMESTAMPTZ | NOT NULL, default: now() |

### projects
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| slug | VARCHAR(255) | UNIQUE, NOT NULL |
| owner_id | UUID | FK → users.id, NOT NULL |
| status | VARCHAR(50) | NOT NULL, default: 'draft' |
| created_at | TIMESTAMPTZ | NOT NULL, default: now() |
| updated_at | TIMESTAMPTZ | NOT NULL, default: now() |

### audit_log
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| user_id | UUID | FK → users.id |
| action | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(100) | NOT NULL |
| entity_id | VARCHAR(255) | |
| details | JSONB | |
| ip_address | VARCHAR(45) | |
| user_agent | TEXT | |
| created_at | TIMESTAMPTZ | NOT NULL, default: now() |

## Schema Files

All schemas are defined as TypeScript using Drizzle ORM in `packages/db/schema/`.
