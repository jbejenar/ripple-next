<script setup lang="ts">
export interface RplCategory {
  /** Display title for the category */
  title: string
  /** Optional description */
  description?: string
  /** Link URL */
  href?: string
  /** Optional icon or emoji */
  icon?: string
  /** Number of items in this category */
  count?: number
}

export interface RplCategoryGridProps {
  /** Array of categories to display */
  categories: RplCategory[]
  /** Number of columns in the grid (2, 3, or 4) */
  columns?: 2 | 3 | 4
  /** Optional heading for the grid */
  title?: string
}

withDefaults(defineProps<RplCategoryGridProps>(), {
  columns: 3,
  title: ''
})
</script>

<template>
  <section class="rpl-category-grid" :aria-label="title || 'Categories'">
    <h2 v-if="title" class="rpl-category-grid__title">{{ title }}</h2>
    <div
      class="rpl-category-grid__grid"
      :class="`rpl-category-grid__grid--cols-${columns}`"
      role="list"
    >
      <component
        :is="cat.href ? 'a' : 'div'"
        v-for="(cat, index) in categories"
        :key="index"
        :href="cat.href || undefined"
        :class="[
          'rpl-category-grid__item',
          { 'rpl-category-grid__item--link': cat.href }
        ]"
        role="listitem"
      >
        <span v-if="cat.icon" class="rpl-category-grid__icon" aria-hidden="true">
          {{ cat.icon }}
        </span>
        <span class="rpl-category-grid__item-title">{{ cat.title }}</span>
        <span v-if="cat.description" class="rpl-category-grid__description">
          {{ cat.description }}
        </span>
        <span v-if="cat.count != null" class="rpl-category-grid__count">
          {{ cat.count }} {{ cat.count === 1 ? 'item' : 'items' }}
        </span>
      </component>
    </div>
  </section>
</template>

<style scoped>
.rpl-category-grid {
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-category-grid__title {
  font-size: var(--rpl-type-size-2xl, 1.5rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333);
  margin: 0 0 var(--rpl-sp-6, 1.5rem);
}

.rpl-category-grid__grid {
  display: grid;
  gap: var(--rpl-sp-4, 1rem);
}

.rpl-category-grid__grid--cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.rpl-category-grid__grid--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.rpl-category-grid__grid--cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 768px) {
  .rpl-category-grid__grid--cols-3,
  .rpl-category-grid__grid--cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .rpl-category-grid__grid--cols-2,
  .rpl-category-grid__grid--cols-3,
  .rpl-category-grid__grid--cols-4 {
    grid-template-columns: 1fr;
  }
}

.rpl-category-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--rpl-sp-6, 1.5rem) var(--rpl-sp-4, 1rem);
  border: 1px solid var(--rpl-clr-border-light, #e0e0e0);
  border-radius: var(--rpl-border-radius, 4px);
  background: var(--rpl-clr-background, #fff);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.rpl-category-grid__item--link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.rpl-category-grid__item--link:hover {
  border-color: var(--rpl-clr-primary, #0052c2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rpl-category-grid__item--link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-category-grid__icon {
  font-size: var(--rpl-type-size-3xl, 2rem);
  margin-bottom: var(--rpl-sp-3, 0.75rem);
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-category-grid__item-title {
  font-size: var(--rpl-type-size-lg, 1.125rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333);
}

.rpl-category-grid__item--link .rpl-category-grid__item-title {
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-category-grid__description {
  font-size: var(--rpl-type-size-sm, 0.875rem);
  color: var(--rpl-clr-text-light, #666);
  margin-top: var(--rpl-sp-2, 0.5rem);
  line-height: 1.5;
}

.rpl-category-grid__count {
  font-size: var(--rpl-type-size-xs, 0.75rem);
  color: var(--rpl-clr-text-light, #666);
  margin-top: var(--rpl-sp-2, 0.5rem);
}
</style>
