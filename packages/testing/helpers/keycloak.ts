/**
 * Keycloak Testcontainer helper for OIDC integration tests.
 *
 * Starts a real Keycloak instance with a pre-configured realm,
 * and provides a helper to simulate the browser-based Authorization Code flow.
 */
import type { StartedTestContainer } from 'testcontainers'

export interface TestKeycloak {
  issuerUrl: string
  port: number
  container: StartedTestContainer
  cleanup: () => Promise<void>
}

export interface TestKeycloakConfig {
  realmImportPath: string
  realmName: string
}

/**
 * Start a Keycloak container with a pre-configured realm.
 * Uses dynamic imports so the testcontainers dependency is only loaded when needed.
 */
export async function setupTestKeycloak(config: TestKeycloakConfig): Promise<TestKeycloak> {
  const { GenericContainer, Wait } = await import('testcontainers')

  const container = await new GenericContainer('quay.io/keycloak/keycloak:26.0')
    .withExposedPorts(8080)
    .withEnvironment({
      KC_BOOTSTRAP_ADMIN_USERNAME: 'admin',
      KC_BOOTSTRAP_ADMIN_PASSWORD: 'admin',
      KC_HEALTH_ENABLED: 'true',
    })
    .withCopyFilesToContainer([{
      source: config.realmImportPath,
      target: `/opt/keycloak/data/import/${config.realmName}-realm.json`,
    }])
    .withCommand(['start-dev', '--import-realm'])
    .withWaitStrategy(Wait.forLogMessage(/Listening on:/, 1))
    .withStartupTimeout(90_000)
    .start()

  const port = container.getMappedPort(8080)
  const host = container.getHost()
  const issuerUrl = `http://${host}:${port}/realms/${config.realmName}`

  await waitForIssuer(issuerUrl)

  return {
    issuerUrl,
    port,
    container,
    cleanup: async () => {
      await container.stop()
    },
  }
}

async function waitForIssuer(issuerUrl: string, maxRetries = 30): Promise<void> {
  const wellKnownUrl = `${issuerUrl}/.well-known/openid-configuration`
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(wellKnownUrl)
      if (res.ok) return
    } catch {
      // Not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`Keycloak issuer not accessible at ${wellKnownUrl} after ${maxRetries}s`)
}

export interface AuthCodeResult {
  code: string
  state: string
}

/**
 * Simulate the browser-based Authorization Code flow against a Keycloak instance.
 * Drives the login form programmatically to obtain an authorization code.
 */
export async function simulateAuthCodeFlow(options: {
  authorizationUrl: URL
  username: string
  password: string
}): Promise<AuthCodeResult> {
  const { authorizationUrl, username, password } = options
  const cookieJar: string[] = []

  // Step 1: Navigate to the authorization URL, following redirects to the login page
  let currentUrl = authorizationUrl.toString()
  let loginPageHtml = ''

  for (let i = 0; i < 10; i++) {
    const res = await fetch(currentUrl, {
      redirect: 'manual',
      headers: cookieJar.length > 0 ? { Cookie: cookieJar.join('; ') } : {},
    })

    collectCookies(res, cookieJar)

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) throw new Error('Redirect without Location header')
      currentUrl = resolveUrl(currentUrl, location)
      continue
    }

    if (res.ok) {
      loginPageHtml = await res.text()
      break
    }

    throw new Error(`Unexpected ${res.status} from ${currentUrl}`)
  }

  if (!loginPageHtml) {
    throw new Error('Could not reach Keycloak login page')
  }

  // Step 2: Parse the login form action URL
  const actionMatch = loginPageHtml.match(/action="([^"]+)"/)
  if (!actionMatch) {
    throw new Error('Could not find login form action URL in Keycloak HTML')
  }
  const formAction = actionMatch[1].replace(/&amp;/g, '&')

  // Step 3: Submit login credentials
  const loginRes = await fetch(formAction, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieJar.join('; '),
    },
    body: new URLSearchParams({ username, password }).toString(),
    redirect: 'manual',
  })

  // Step 4: Extract authorization code from redirect
  if (loginRes.status !== 302) {
    throw new Error(`Expected 302 after login, got ${loginRes.status}`)
  }

  const location = loginRes.headers.get('location')
  if (!location) {
    throw new Error('No Location header in login response')
  }

  const callbackUrl = new URL(location)
  const code = callbackUrl.searchParams.get('code')
  const state = callbackUrl.searchParams.get('state')

  if (!code) {
    const error = callbackUrl.searchParams.get('error')
    throw new Error(`No auth code in callback. Error: ${error ?? 'unknown'}`)
  }

  return { code, state: state ?? '' }
}

function collectCookies(response: Response, jar: string[]): void {
  const setCookies = response.headers.getSetCookie?.() ?? []
  for (const header of setCookies) {
    const nameValue = header.split(';')[0]
    const name = nameValue.split('=')[0]
    const idx = jar.findIndex(c => c.startsWith(`${name}=`))
    if (idx >= 0) {
      jar[idx] = nameValue
    } else {
      jar.push(nameValue)
    }
  }
}

function resolveUrl(base: string, location: string): string {
  if (location.startsWith('http')) return location
  return new URL(location, base).toString()
}
