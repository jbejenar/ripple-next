import type { AuthProvider } from '@ripple/auth'
import { OidcAuthProvider, MockAuthProvider } from '@ripple/auth'
import { getDatabase, SessionRepository, UserRepository } from '@ripple/db'

let provider: AuthProvider | null = null

export function getAuthProvider(): AuthProvider {
  if (provider) return provider

  const config = useRuntimeConfig()

  if (process.env.NODE_ENV === 'test') {
    provider = new MockAuthProvider()
    return provider
  }

  const db = getDatabase(config.databaseUrl)
  const sessionRepo = new SessionRepository(db)
  const userRepo = new UserRepository(db)

  provider = new OidcAuthProvider(
    {
      issuerUrl: config.oidcIssuerUrl,
      clientId: config.oidcClientId,
      clientSecret: config.oidcClientSecret,
      redirectUri: config.oidcRedirectUri,
      scopes: ['openid', 'email', 'profile']
    },
    {
      async create(userId: string) {
        const token = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        await sessionRepo.create({ userId, token, expiresAt })
        const user = await userRepo.findById(userId)
        return {
          id: token,
          userId,
          user: { id: user!.id, email: user!.email, name: user!.name, role: user!.role },
          expiresAt
        }
      },
      async validate(sessionId: string) {
        const row = await sessionRepo.findByToken(sessionId)
        if (!row || row.expiresAt < new Date()) return null
        const user = await userRepo.findById(row.userId)
        if (!user) return null
        return {
          id: row.token,
          userId: row.userId,
          user: { id: user.id, email: user.email, name: user.name, role: user.role },
          expiresAt: row.expiresAt
        }
      },
      async invalidate(sessionId: string) {
        await sessionRepo.deleteByToken(sessionId)
      }
    },
    {
      async findOrCreateByOidcSub(sub: string, email: string, name: string) {
        let user = await userRepo.findByOidcSub(sub)
        if (!user) {
          user = await userRepo.findByEmail(email)
          if (user) {
            user = await userRepo.update(user.id, { oidcSub: sub })
          } else {
            user = await userRepo.create({ email, name, oidcSub: sub, role: 'user' })
          }
        }
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    }
  )

  return provider
}
