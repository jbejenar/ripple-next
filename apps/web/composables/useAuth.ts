export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  async function login(): Promise<void> {
    await navigateTo('/auth/redirect', { external: true })
  }

  async function logout(): Promise<void> {
    await $fetch('/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/auth/login')
  }

  async function fetchUser(): Promise<void> {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const data = await $fetch<AuthUser>('/api/orpc/v1/users/me', { headers })
      user.value = data ?? null
    } catch {
      user.value = null
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    fetchUser
  }
}
