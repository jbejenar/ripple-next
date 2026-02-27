export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, fetchUser } = useAuth()

  if (import.meta.server) {
    await fetchUser()
  }

  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }
})
