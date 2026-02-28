<script setup lang="ts">
import { computed } from 'vue'
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

const heroSections: PageSection['type'][] = ['call-to-action', 'key-dates']

const featuredSections = computed(() =>
  props.page.sections.filter((s) => heroSections.includes(s.type))
)

const bodySections = computed(() =>
  props.page.sections.filter((s) => !heroSections.includes(s.type))
)
</script>

<template>
  <div class="rpl-campaign-page">
    <RplHeroHeader
      :title="props.page.title"
      :description="props.page.summary"
      :background-image="props.page.featuredImage?.src"
    />

    <div v-if="featuredSections.length > 0" class="rpl-campaign-page__featured">
      <div class="rpl-campaign-page__featured-inner">
        <template v-for="(section, index) in featuredSections" :key="`featured-${index}`">
          <component
            :is="getSectionComponent(section)"
            v-bind="section"
          />
        </template>
      </div>
    </div>

    <div v-if="bodySections.length > 0" class="rpl-campaign-page__body">
      <div class="rpl-campaign-page__body-inner">
        <template v-for="(section, index) in bodySections" :key="`body-${index}`">
          <component
            :is="getSectionComponent(section)"
            v-bind="section"
          />
        </template>
      </div>
    </div>

    <div v-if="props.page.taxonomy.length > 0" class="rpl-campaign-page__taxonomy">
      <div class="rpl-campaign-page__taxonomy-inner">
        <span
          v-for="term in props.page.taxonomy"
          :key="term.id"
          class="rpl-campaign-page__tag"
        >
          {{ term.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rpl-campaign-page__featured {
  padding: 2.5rem 1.5rem;
  background-color: var(--rpl-clr-light, #f5f5f5);
}

.rpl-campaign-page__featured-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.rpl-campaign-page__body {
  padding: 2.5rem 1.5rem;
}

.rpl-campaign-page__body-inner {
  max-width: 960px;
  margin: 0 auto;
}

.rpl-campaign-page__taxonomy {
  padding: 1rem 1.5rem 2.5rem;
  border-top: 1px solid var(--rpl-clr-border, #e0e0e0);
}

.rpl-campaign-page__taxonomy-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rpl-campaign-page__tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  background-color: var(--rpl-clr-light, #f5f5f5);
  border-radius: 4px;
  color: var(--rpl-clr-type-default, #333);
}
</style>
