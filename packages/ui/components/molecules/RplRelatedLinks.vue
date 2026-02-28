<script setup lang="ts">
export interface RplRelatedLink {
  text: string
  url: string
}

export interface RplRelatedLinksProps {
  /** Section title */
  title?: string
  /** List of related links */
  links: RplRelatedLink[]
}

withDefaults(defineProps<RplRelatedLinksProps>(), {
  title: 'Related links'
})
</script>

<template>
  <nav :aria-label="title" class="rpl-related-links">
    <h2 class="rpl-related-links__title">{{ title }}</h2>
    <ul class="rpl-related-links__list">
      <li
        v-for="(link, index) in links"
        :key="index"
        class="rpl-related-links__item"
      >
        <a :href="link.url" class="rpl-related-links__link">
          {{ link.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.rpl-related-links {
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
  padding: var(--rpl-sp-6, 1.5rem);
  background-color: var(--rpl-clr-background-light, #f5f5f5);
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-related-links__title {
  margin: 0 0 var(--rpl-sp-4, 1rem);
  font-size: var(--rpl-type-size-lg, 1.125rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333);
}

.rpl-related-links__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rpl-related-links__item {
  margin-bottom: var(--rpl-sp-3, 0.75rem);
  padding-left: var(--rpl-sp-4, 1rem);
  position: relative;
}

.rpl-related-links__item::before {
  content: '\203A';
  position: absolute;
  left: 0;
  color: var(--rpl-clr-primary, #0052c2);
  font-weight: 700;
}

.rpl-related-links__item:last-child {
  margin-bottom: 0;
}

.rpl-related-links__link {
  color: var(--rpl-clr-primary, #0052c2);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: var(--rpl-type-size-base, 1rem);
  line-height: 1.5;
}

.rpl-related-links__link:hover {
  color: var(--rpl-clr-primary-dark, #003e91);
  text-decoration-thickness: 2px;
}

.rpl-related-links__link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
