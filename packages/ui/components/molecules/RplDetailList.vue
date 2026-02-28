<script setup lang="ts">
export interface RplDetail {
  /** The term or key */
  term: string
  /** The description or value */
  description: string
}

export interface RplDetailListProps {
  /** Array of term–description pairs */
  details: RplDetail[]
  /** Layout variant */
  variant?: 'stacked' | 'inline' | 'grid'
  /** Optional heading */
  title?: string
}

withDefaults(defineProps<RplDetailListProps>(), {
  variant: 'stacked',
  title: ''
})
</script>

<template>
  <section class="rpl-detail-list" :aria-label="title || 'Details'">
    <h2 v-if="title" class="rpl-detail-list__title">{{ title }}</h2>
    <dl :class="['rpl-detail-list__list', `rpl-detail-list__list--${variant}`]">
      <div
        v-for="(detail, index) in details"
        :key="index"
        class="rpl-detail-list__item"
      >
        <dt class="rpl-detail-list__term">{{ detail.term }}</dt>
        <dd class="rpl-detail-list__description">{{ detail.description }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.rpl-detail-list {
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-detail-list__title {
  font-size: var(--rpl-type-size-2xl, 1.5rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333);
  margin: 0 0 var(--rpl-sp-6, 1.5rem);
}

.rpl-detail-list__list {
  margin: 0;
}

/* Stacked variant (default) */
.rpl-detail-list__list--stacked .rpl-detail-list__item {
  padding: var(--rpl-sp-3, 0.75rem) 0;
  border-bottom: 1px solid var(--rpl-clr-border-light, #e0e0e0);
}

.rpl-detail-list__list--stacked .rpl-detail-list__item:first-child {
  border-top: 1px solid var(--rpl-clr-border-light, #e0e0e0);
}

/* Inline variant */
.rpl-detail-list__list--inline .rpl-detail-list__item {
  display: flex;
  gap: var(--rpl-sp-4, 1rem);
  padding: var(--rpl-sp-3, 0.75rem) 0;
  border-bottom: 1px solid var(--rpl-clr-border-light, #e0e0e0);
}

.rpl-detail-list__list--inline .rpl-detail-list__item:first-child {
  border-top: 1px solid var(--rpl-clr-border-light, #e0e0e0);
}

.rpl-detail-list__list--inline .rpl-detail-list__term {
  flex: 0 0 200px;
}

/* Grid variant */
.rpl-detail-list__list--grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--rpl-sp-4, 1rem);
}

.rpl-detail-list__list--grid .rpl-detail-list__item {
  padding: var(--rpl-sp-4, 1rem);
  border: 1px solid var(--rpl-clr-border-light, #e0e0e0);
  border-radius: var(--rpl-border-radius, 4px);
  background: var(--rpl-clr-background, #fff);
}

@media (max-width: 480px) {
  .rpl-detail-list__list--grid {
    grid-template-columns: 1fr;
  }

  .rpl-detail-list__list--inline .rpl-detail-list__item {
    flex-direction: column;
    gap: var(--rpl-sp-1, 0.25rem);
  }

  .rpl-detail-list__list--inline .rpl-detail-list__term {
    flex: none;
  }
}

.rpl-detail-list__term {
  font-weight: 700;
  color: var(--rpl-clr-text, #333);
  font-size: var(--rpl-type-size-base, 1rem);
  margin: 0;
}

.rpl-detail-list__description {
  color: var(--rpl-clr-text, #333);
  font-size: var(--rpl-type-size-base, 1rem);
  line-height: 1.5;
  margin: var(--rpl-sp-1, 0.25rem) 0 0;
}

.rpl-detail-list__list--inline .rpl-detail-list__description {
  margin: 0;
}

.rpl-detail-list__list--grid .rpl-detail-list__description {
  margin-top: var(--rpl-sp-2, 0.5rem);
}
</style>
