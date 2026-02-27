import type { H3Event } from 'h3'
import { getCookie } from 'h3'
import type { Session } from '@ripple/auth'
import { getAuthProvider } from './auth-provider'

const SESSION_COOKIE = 'session_token'

export async function getSessionFromEvent(event: H3Event): Promise<Session | null> {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null

  const auth = getAuthProvider()
  return auth.validateSession(token)
}
