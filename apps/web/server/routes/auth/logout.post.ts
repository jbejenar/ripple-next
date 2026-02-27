import { getCookie, deleteCookie, sendRedirect } from 'h3'
import { getAuthProvider } from '../../utils/auth-provider'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'session_token')
  if (token) {
    const auth = getAuthProvider()
    await auth.invalidateSession(token)
  }

  deleteCookie(event, 'session_token')
  return sendRedirect(event, '/auth/login')
})
