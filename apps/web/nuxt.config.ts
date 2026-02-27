export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },

  typescript: {
    strict: true,
    typeCheck: false // Type checking runs separately via `pnpm typecheck`
  },

  modules: ['@pinia/nuxt', '@ripple/ui/nuxt'],

  // Nuxt layers for feature separation
  extends: ['./layers/core', './layers/auth', './layers/admin', './layers/public'],

  // Nitro server config (deploys to Lambda via SST)
  // NITRO_PRESET env var overrides for e2e tests (node-server)
  nitro: {
    preset: process.env.NITRO_PRESET || 'aws-lambda',
    compressPublicAssets: true
  },

  // Runtime config
  runtimeConfig: {
    // Server-only config
    databaseUrl: '',
    redisUrl: '',
    sessionSecret: '',
    oidcIssuerUrl: '',
    oidcClientId: '',
    oidcClientSecret: '',
    oidcRedirectUri: '',
    // Public config (exposed to client)
    public: {
      appName: 'Ripple Next',
      wsUrl: ''
    }
  },

  // Auto-import configuration
  imports: {
    dirs: ['composables/**', 'stores/**']
  },

  // Component auto-import
  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  // SSR enabled by default
  ssr: true
})
