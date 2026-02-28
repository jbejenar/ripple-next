<script setup lang="ts">
export interface RplResultItem {
  /** Result title */
  title: string
  /** Result URL */
  href: string
  /** Short description or summary */
  description?: string
  /** Metadata items shown below the title (e.g. date, type, author) */
  metadata?: Array<{ label: string; value: string }>
  /** Optional topic/category tag */
  topic?: string
}

export interface RplResultsListingProps {
  /** Array of result items */
  results: RplResultItem[]
  /** Optional heading */
  title?: string
  /** Total number of results (may differ from results.length for paginated views) */
  totalResults?: number
  /** Accessible label for the results list */
  ariaLabel?: string
}

withDefaults(defineProps<RplResultsListingProps>(), {
  title: '',
  totalResults: 0,
  ariaLabel: 'Search results'
})
</script>

<template>
  <section class="rpl-results-listing" :aria-label="ariaLabel">
    <div v-if="title || totalResults" class="rpl-results-listing__header">
      <h2 v-if="title" class="rpl-results-listing__title">{{ title }}</h2>
      <p v-if="totalResults" class="rpl-results-listing__count">
        {{ totalResults }} {{ totalResults === 1 ? 'result' : 'results' }}
      </p>
    </div>
    <ol v-if="results.length > 0" class="rpl-results-listing__list">
      <li
        v-for="(item, index) in results"
        :key="index"
        class="rpl-results-listing__item"
      >
        <span v-if="item.topic" class="rpl-results-listing__topic">
          {{ item.topic }}
        </span>
        <h3 class="rpl-results-listing__item-title">
          <a :href="item.href" class="rpl-results-listing__link">
            {{ item.title }}
          </a>
        </h3>
        <p v-if="item.description" class="rpl-results-listing__description">
          {{ item.description }}
        </p>
        <dl
          v-if="item.metadata && item.metadata.length > 0"
          class="rpl-results-listing__metadata"
        >
          <div
            v-for="(meta, metaIndex) in item.metadata"
            :key="metaIndex"
            class="rpl-results-listing__meta-item"
          >
            <dt class="rpl-results-listing__meta-label">{{ meta.label }}:</dt>
            <dd class="rpl-results-listing__meta-value">{{ meta.value }}</dd>
          </div>
        </dl>
      </li>
    </ol>
    <div v-else class="rpl-results-listing__empty">
      <slot name="empty">
        <p class="rpl-results-listing__empty-text">No results found</p>
      </slot>
    </div>
  </section>
</template>

<style scoped>
.rpl-results-listing {
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-results-listing__header {
  display: flex;
  align-items: baseline;
  gap: var(--rpl-sp-4, 1rem);
  margin-bottom: var(--rpl-sp-6, 1.5rem);
  flex-wrap: wrap;
}

.rpl-results-listing__title {
  font-size: var(--rpl-type-size-2xl, 1.5rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333);
  margin: 0;
}

.rpl-results-listing__count {
  font-size: var(--rpl-type-size-sm, 0.875rem);
  color: var(--rpl-clr-text-light, #666);
  margin: 0;
}

.rpl-results-listing__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rpl-results-listing__item {
  padding: var(--rpl-sp-4, 1rem) 0;
  border-bottom: 1px solid var(--rpl-clr-border-light, #e0e0e0);
}

.rpl-results-listing__item:first-child {
  border-top: 1px solid var(--rpl-clr-border-light, #e0e0e0);
}

.rpl-results-listing__topic {
  display: inline-block;
  font-size: var(--rpl-type-size-xs, 0.75rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--rpl-clr-primary, #0052c2);
  margin-bottom: var(--rpl-sp-1, 0.25rem);
}

.rpl-results-listing__item-title {
  margin: 0 0 var(--rpl-sp-2, 0.5rem);
  font-size: var(--rpl-type-size-lg, 1.125rem);
  font-weight: 700;
  line-height: 1.3;
}

.rpl-results-listing__link {
  color: var(--rpl-clr-primary, #0052c2);
  text-decoration: none;
}

.rpl-results-listing__link:hover {
  text-decoration: underline;
}

.rpl-results-listing__link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-results-listing__description {
  margin: 0 0 var(--rpl-sp-2, 0.5rem);
  font-size: var(--rpl-type-size-base, 1rem);
  color: var(--rpl-clr-text, #333);
  line-height: 1.5;
}

.rpl-results-listing__metadata {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rpl-sp-4, 1rem);
  margin: 0;
}

.rpl-results-listing__meta-item {
  display: flex;
  gap: var(--rpl-sp-1, 0.25rem);
  font-size: var(--rpl-type-size-sm, 0.875rem);
}

.rpl-results-listing__meta-label {
  color: var(--rpl-clr-text-light, #666);
  font-weight: 600;
  margin: 0;
}

.rpl-results-listing__meta-value {
  color: var(--rpl-clr-text, #333);
  margin: 0;
}

.rpl-results-listing__empty {
  padding: var(--rpl-sp-8, 2rem) 0;
  text-align: center;
}

.rpl-results-listing__empty-text {
  font-size: var(--rpl-type-size-base, 1rem);
  color: var(--rpl-clr-text-light, #666);
  font-style: italic;
  margin: 0;
}
</style>
