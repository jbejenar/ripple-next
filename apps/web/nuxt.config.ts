export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },

  typescript: {
    strict: true,
    typeCheck: true
  },

  modules: ['@pinia/nuxt', '@ripple/ui/nuxt'],

  // Nuxt layers for feature separation
  extends: [
    './layers/core',
    './layers/auth',
    './layers/admin',
    './layers/public'
  ],

  // Nitro server config (deploys to Lambda via SST)
  nitro: {
    preset: 'aws-lambda',
    compressPublicAssets: true
  },

  // Runtime config
  runtimeConfig: {
    // Server-only config
    databaseUrl: '',
    redisUrl: '',
    sessionSecret: '',
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
