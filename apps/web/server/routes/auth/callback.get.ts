import { getCookie, setCookie, deleteCookie, sendRedirect, getQuery, createError } from 'h3'
import { getAuthProvider } from '../../utils/auth-provider'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string
  const returnedState = query.state as string
  const error = query.error as string

  if (error) {
    throw createError({ statusCode: 401, message: `OIDC error: ${error}` })
  }

  const savedState = getCookie(event, 'oidc_state')
  const codeVerifier = getCookie(event, 'oidc_verifier')

  if (!savedState || savedState !== returnedState) {
    throw createError({ statusCode: 400, message: 'Invalid state parameter' })
  }
  if (!codeVerifier) {
    throw createError({ statusCode: 400, message: 'Missing code verifier' })
  }

  deleteCookie(event, 'oidc_state')
  deleteCookie(event, 'oidc_verifier')

  const auth = getAuthProvider()
  const user = await auth.handleCallback(code, returnedState, codeVerifier)
  const session = await auth.createSession(user.id)
  const isSecure = process.env.NODE_ENV === 'production'

  setCookie(event, 'session_token', session.id, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  })

  return sendRedirect(event, '/dashboard')
})
