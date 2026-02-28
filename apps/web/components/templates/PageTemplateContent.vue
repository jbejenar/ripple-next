<script setup lang="ts">
import type { CmsPage, PageSection } from '@ripple/cms'

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
    'embedded-video': 'RplEmbeddedVideo'
  }
  return componentMap[section.type] ?? 'RplContentWysiwyg'
}
</script>

<template>
  <div class="rpl-content-page">
    <RplHeroHeader
      :title="props.page.title"
      :description="props.page.summary"
    />

    <div class="rpl-content-page__body">
      <template v-for="(section, index) in props.page.sections" :key="index">
        <component
          :is="getSectionComponent(section)"
          v-bind="section"
        />
      </template>
    </div>

    <div v-if="props.page.taxonomy.length > 0" class="rpl-content-page__taxonomy">
      <span
        v-for="term in props.page.taxonomy"
        :key="term.id"
        class="rpl-content-page__tag"
      >
        {{ term.name }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.rpl-content-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1rem;
}

.rpl-content-page__body {
  padding: 2rem 0;
}

.rpl-content-page__taxonomy {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem 0 2rem;
  border-top: 1px solid var(--rpl-clr-border, #e0e0e0);
}

.rpl-content-page__tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  background-color: var(--rpl-clr-light, #f5f5f5);
  border-radius: 4px;
  color: var(--rpl-clr-type-default, #333);
}
</style>
