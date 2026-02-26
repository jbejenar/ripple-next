import type { H3Event } from 'h3'

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
  // Session will be resolved from auth middleware
  // In production, this uses SST Resource for DB connections
  const session: Session | null = null

  return {
    event,
    session
  }
}
