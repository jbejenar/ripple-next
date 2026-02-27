import { eq, lt } from 'drizzle-orm'
import type { Database } from '../client'
import { sessions, type SessionRow, type NewSessionRow } from '../schema'

export class SessionRepository {
  constructor(private db: Database) {}

  async create(data: NewSessionRow): Promise<SessionRow> {
    const [session] = await this.db.insert(sessions).values(data).returning()
    return session!
  }

  async findByToken(token: string): Promise<SessionRow | undefined> {
    const [session] = await this.db.select().from(sessions).where(eq(sessions.token, token))
    return session
  }

  async deleteByToken(token: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.token, token))
  }

  async deleteExpired(): Promise<void> {
    await this.db.delete(sessions).where(lt(sessions.expiresAt, new Date()))
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, userId))
  }
}
