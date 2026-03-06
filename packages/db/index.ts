// Database package — Drizzle ORM + PostgreSQL

// Schema types (public API for consumers)
export type { User, NewUser } from './schema/users'
export type { Project, NewProject } from './schema/projects'
export type { AuditLogEntry, NewAuditLogEntry } from './schema/audit-log'
export type { SessionRow, NewSessionRow } from './schema/sessions'

// Schema table objects (needed for query building within the monorepo)
export { users } from './schema/users'
export { projects } from './schema/projects'
export { auditLog } from './schema/audit-log'
export { sessions } from './schema/sessions'

// Client
export { createDatabase, getDatabase } from './client'
export type { Database } from './client'

// Repositories
export { UserRepository } from './repositories/user.repository'
export { ProjectRepository } from './repositories/project.repository'
export { SessionRepository } from './repositories/session.repository'
