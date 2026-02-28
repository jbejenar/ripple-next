<script setup lang="ts">
export interface RplBlockQuoteProps {
  /** Name of the person being quoted */
  author?: string
  /** Role, title, or affiliation of the author */
  authorTitle?: string
}

withDefaults(defineProps<RplBlockQuoteProps>(), {
  author: '',
  authorTitle: ''
})
</script>

<template>
  <figure class="rpl-blockquote">
    <blockquote class="rpl-blockquote__quote">
      <slot />
    </blockquote>
    <figcaption v-if="author" class="rpl-blockquote__attribution">
      <span class="rpl-blockquote__author">{{ author }}</span>
      <span v-if="authorTitle" class="rpl-blockquote__author-title">{{ authorTitle }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.rpl-blockquote {
  margin: 0 0 var(--rpl-sp-6, 1.5rem) 0;
  padding: var(--rpl-sp-5, 1.25rem) var(--rpl-sp-6, 1.5rem);
  border-left: 4px solid var(--rpl-clr-primary, #0052c2);
  background-color: var(--rpl-clr-background-light, #f5f5f5);
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-blockquote__quote {
  margin: 0 0 var(--rpl-sp-3, 0.75rem) 0;
  padding: 0;
  font-size: var(--rpl-type-size-lg, 1.125rem);
  font-style: italic;
  line-height: 1.6;
  color: var(--rpl-clr-text, #333);
}

.rpl-blockquote__attribution {
  display: flex;
  flex-direction: column;
  gap: var(--rpl-sp-1, 0.25rem);
}

.rpl-blockquote__author {
  font-weight: 600;
  font-size: var(--rpl-type-size-base, 1rem);
  color: var(--rpl-clr-text, #333);
}

.rpl-blockquote__author-title {
  font-size: var(--rpl-type-size-sm, 0.875rem);
  color: var(--rpl-clr-text-light, #666);
}
</style>
