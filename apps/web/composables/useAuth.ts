export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  async function login(email: string, password: string): Promise<void> {
    // Will be implemented with @ripple/auth
    void email
    void password
  }

  async function logout(): Promise<void> {
    user.value = null
    await navigateTo('/auth/login')
  }

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout
  }
}
