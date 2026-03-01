import { setCookie, sendRedirect } from 'h3'
import { generateRandomCodeVerifier } from '@ripple-next/auth'
import { getAuthProvider } from '../../utils/auth-provider'

export default defineEventHandler(async (event) => {
  const state = crypto.randomUUID()
  const codeVerifier = generateRandomCodeVerifier()
  const isSecure = process.env.NODE_ENV === 'production'

  setCookie(event, 'oidc_state', state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 600,
    path: '/'
  })
  setCookie(event, 'oidc_verifier', codeVerifier, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 600,
    path: '/'
  })

  const auth = getAuthProvider()
  const url = await auth.getAuthorizationUrl(state, codeVerifier)

  return sendRedirect(event, url.toString())
})
