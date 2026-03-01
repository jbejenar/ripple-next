<script setup lang="ts">
import type { CmsPage, PageSection } from '@ripple-next/cms'

const props = defineProps<{
  page: CmsPage
}>()

function getSectionComponent(section: PageSection): string {
  const componentMap: Record<string, string> = {
    wysiwyg: 'RplContentWysiwyg',
    accordion: 'RplAccordion',
    'card-collection': 'RplCardCollection',
    timeline: 'RplTimeline',
    'call-to-action': 'RplCallToAction',
    'key-dates': 'RplKeyDates',
    image: 'RplContentImage',
    'embedded-video': 'RplEmbeddedVideo',
    'media-gallery': 'RplMediaGallery',
    'document-download': 'RplDocumentDownload'
  }
  return componentMap[section.type] ?? 'RplContentWysiwyg'
}
</script>

<template>
  <div class="rpl-landing-page">
    <RplHeroHeader
      :title="props.page.title"
      :description="props.page.summary"
      :background-image="props.page.featuredImage?.src"
    />

    <div class="rpl-landing-page__body">
      <template v-for="(section, index) in props.page.sections" :key="index">
        <div
          class="rpl-landing-page__section"
          :class="{ 'rpl-landing-page__section--alt': index % 2 === 1 }"
        >
          <div class="rpl-landing-page__section-inner">
            <component
              :is="getSectionComponent(section)"
              v-bind="section"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.rpl-landing-page__body {
  padding: 0;
}

.rpl-landing-page__section {
  padding: 3rem 1.5rem;
}

.rpl-landing-page__section--alt {
  background-color: var(--rpl-clr-light, #f5f5f5);
}

.rpl-landing-page__section-inner {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
