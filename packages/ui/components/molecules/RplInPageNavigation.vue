<script setup lang="ts">
export interface RplInPageNavigationItem {
  id: string
  label: string
}

export interface RplInPageNavigationProps {
  items: RplInPageNavigationItem[]
  title?: string
  ariaLabel?: string
}

withDefaults(defineProps<RplInPageNavigationProps>(), {
  title: 'On this page',
  ariaLabel: 'On this page'
})
</script>

<template>
  <nav :aria-label="ariaLabel" class="rpl-in-page-navigation">
    <h2 class="rpl-in-page-navigation__title">{{ title }}</h2>
    <ul class="rpl-in-page-navigation__list">
      <li
        v-for="item in items"
        :key="item.id"
        class="rpl-in-page-navigation__item"
      >
        <a :href="`#${item.id}`" class="rpl-in-page-navigation__link">
          {{ item.label }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.rpl-in-page-navigation {
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
  padding: var(--rpl-sp-6, 1.5rem);
  background-color: var(--rpl-clr-background-light, #f5f5f5);
  border-radius: var(--rpl-border-radius, 4px);
  border-left: 4px solid var(--rpl-clr-primary, #0052c2);
}

.rpl-in-page-navigation__title {
  margin: 0 0 var(--rpl-sp-4, 1rem);
  font-size: var(--rpl-type-size-lg, 1.125rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333333);
}

.rpl-in-page-navigation__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rpl-in-page-navigation__item {
  margin-bottom: var(--rpl-sp-2, 0.5rem);
}

.rpl-in-page-navigation__item:last-child {
  margin-bottom: 0;
}

.rpl-in-page-navigation__link {
  display: inline-block;
  padding: var(--rpl-sp-1, 0.25rem) 0;
  color: var(--rpl-clr-primary, #0052c2);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: var(--rpl-type-size-base, 1rem);
  line-height: 1.5;
}

.rpl-in-page-navigation__link:hover {
  color: var(--rpl-clr-primary-dark, #003e91);
  text-decoration-thickness: 2px;
}

.rpl-in-page-navigation__link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
