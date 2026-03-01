import type { H3Event } from 'h3'
import type { Database } from '@ripple/db'
import { getDatabase } from '@ripple/db'
import { getSessionFromEvent } from '../utils/auth'

export interface SessionUser {
  id: string
  email: string
  role: string
}

export interface AppSession {
  user: SessionUser | null
}

export interface Context {
  event: H3Event
  session: AppSession | null
  db: Database | undefined
}

export interface AuthenticatedContext extends Context {
  session: { user: SessionUser }
}

export async function createContext(event: H3Event): Promise<Context> {
  const authSession = await getSessionFromEvent(event)

  const session: AppSession | null = authSession
    ? {
        user: {
          id: authSession.user.id,
          email: authSession.user.email,
          role: authSession.user.role
        }
      }
    : null

  const config = useRuntimeConfig()
  let db: Database | undefined
  if (config.databaseUrl) {
    db = getDatabase(config.databaseUrl)
  }

  return {
    event,
    session,
    db
  }
}
