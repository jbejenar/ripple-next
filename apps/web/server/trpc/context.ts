import type { H3Event } from 'h3'
import type { Database } from '@ripple/db'
import { getDatabase } from '@ripple/db'
import { getSessionFromEvent } from '../utils/auth'

export interface Session {
  user: {
    id: string
    email: string
    role: string
  } | null
}

export interface Context {
  event: H3Event
  session: Session | null
  db: Database
}

export async function createContext(event: H3Event): Promise<Context> {
  const authSession = await getSessionFromEvent(event)

  const session: Session | null = authSession
    ? {
        user: {
          id: authSession.user.id,
          email: authSession.user.email,
          role: authSession.user.role
        }
      }
    : null

  const config = useRuntimeConfig()
  const db = getDatabase(config.databaseUrl)

  return {
    event,
    session,
    db
  }
}
