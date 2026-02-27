import { defineNuxtModule, addComponentsDir, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@ripple/ui',
    configKey: 'rippleUi'
  },
  defaults: {},
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Auto-import all Ripple UI components
    addComponentsDir({
      path: resolve('./components/atoms'),
      prefix: '',
      global: true
    })
    addComponentsDir({
      path: resolve('./components/molecules'),
      prefix: '',
      global: true
    })
    addComponentsDir({
      path: resolve('./components/organisms'),
      prefix: '',
      pathPrefix: false,
      global: true
    })

    // Add Ripple CSS tokens
    nuxt.options.css.push(resolve('./tokens/global.css'))
  }
})
