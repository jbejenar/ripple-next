<script setup lang="ts">
import type { CmsPage } from '@ripple-next/cms'

const route = useRoute()
const slug = Array.isArray(route.params.slug)
  ? route.params.slug.join('/')
  : (route.params.slug ?? '')

const { data: page, error } = await useFetch<CmsPage>(`/api/cms/page/${slug}`)

if (error.value?.statusCode === 404 || !page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

if (page.value) {
  useHead({
    title: page.value.meta.title ?? page.value.title,
    meta: [
      { name: 'description', content: page.value.meta.description ?? page.value.summary ?? '' },
      ...(page.value.meta.noIndex ? [{ name: 'robots', content: 'noindex' }] : [])
    ]
  })
}

const templateComponent = computed(() => {
  switch (page.value?.contentType) {
    case 'landing_page':
      return 'PageTemplateLanding'
    case 'campaign':
      return 'PageTemplateCampaign'
    default:
      return 'PageTemplateContent'
  }
})
</script>

<template>
  <component
    v-if="page"
    :is="templateComponent"
    :page="page"
  />
</template>
