<script setup lang="ts">
export interface RplStatistic {
  /** The numeric or text value displayed prominently */
  value: string
  /** Label describing the statistic */
  label: string
  /** Optional description or context */
  description?: string
  /** Optional icon name */
  icon?: string
}

export interface RplStatisticsGridProps {
  /** Array of statistics to display */
  statistics: RplStatistic[]
  /** Number of columns in the grid (2, 3, or 4) */
  columns?: 2 | 3 | 4
  /** Optional heading for the statistics section */
  title?: string
}

withDefaults(defineProps<RplStatisticsGridProps>(), {
  columns: 3,
  title: ''
})
</script>

<template>
  <section class="rpl-statistics-grid" :aria-label="title || 'Statistics'">
    <h2 v-if="title" class="rpl-statistics-grid__title">{{ title }}</h2>
    <div
      class="rpl-statistics-grid__grid"
      :class="`rpl-statistics-grid__grid--cols-${columns}`"
      role="list"
    >
      <div
        v-for="(stat, index) in statistics"
        :key="index"
        class="rpl-statistics-grid__item"
        role="listitem"
      >
        <span v-if="stat.icon" class="rpl-statistics-grid__icon" aria-hidden="true">
          {{ stat.icon }}
        </span>
        <span class="rpl-statistics-grid__value">{{ stat.value }}</span>
        <span class="rpl-statistics-grid__label">{{ stat.label }}</span>
        <span v-if="stat.description" class="rpl-statistics-grid__description">
          {{ stat.description }}
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rpl-statistics-grid {
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-statistics-grid__title {
  font-size: var(--rpl-type-size-2xl, 1.5rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333);
  margin: 0 0 var(--rpl-sp-6, 1.5rem);
}

.rpl-statistics-grid__grid {
  display: grid;
  gap: var(--rpl-sp-6, 1.5rem);
}

.rpl-statistics-grid__grid--cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.rpl-statistics-grid__grid--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.rpl-statistics-grid__grid--cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 768px) {
  .rpl-statistics-grid__grid--cols-3,
  .rpl-statistics-grid__grid--cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .rpl-statistics-grid__grid--cols-2,
  .rpl-statistics-grid__grid--cols-3,
  .rpl-statistics-grid__grid--cols-4 {
    grid-template-columns: 1fr;
  }
}

.rpl-statistics-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--rpl-sp-6, 1.5rem);
  border: 1px solid var(--rpl-clr-border-light, #e0e0e0);
  border-radius: var(--rpl-border-radius, 4px);
  background: var(--rpl-clr-background, #fff);
}

.rpl-statistics-grid__icon {
  font-size: var(--rpl-type-size-2xl, 1.5rem);
  margin-bottom: var(--rpl-sp-2, 0.5rem);
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-statistics-grid__value {
  font-size: var(--rpl-type-size-4xl, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-statistics-grid__label {
  font-size: var(--rpl-type-size-base, 1rem);
  font-weight: 600;
  color: var(--rpl-clr-text, #333);
  margin-top: var(--rpl-sp-2, 0.5rem);
}

.rpl-statistics-grid__description {
  font-size: var(--rpl-type-size-sm, 0.875rem);
  color: var(--rpl-clr-text-light, #666);
  margin-top: var(--rpl-sp-1, 0.25rem);
  line-height: 1.5;
}
</style>
