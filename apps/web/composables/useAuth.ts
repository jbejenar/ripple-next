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
    await navigateTo('/auth/login', { external: true })
  }

  async function logout(): Promise<void> {
    await $fetch('/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/auth/login')
  }

  async function fetchUser(): Promise<void> {
    try {
      const data = await $fetch<{ result: { data: AuthUser } }>('/api/trpc/user.me')
      user.value = data?.result?.data ?? null
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
