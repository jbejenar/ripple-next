import type { H3Event } from 'h3'
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

  return {
    event,
    session
  }
}
