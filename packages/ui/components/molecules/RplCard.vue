<script setup lang="ts">
export interface RplCardProps {
  title?: string
  description?: string
  href?: string
  image?: string
  imageAlt?: string
}

defineProps<RplCardProps>()
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href"
    :class="['rpl-card', { 'rpl-card--link': href }]"
  >
    <div v-if="image" class="rpl-card__image">
      <img :src="image" :alt="imageAlt || ''" loading="lazy" />
    </div>
    <div class="rpl-card__content">
      <h3 v-if="title" class="rpl-card__title">{{ title }}</h3>
      <p v-if="description" class="rpl-card__description">{{ description }}</p>
      <slot />
    </div>
  </component>
</template>

<style scoped>
.rpl-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--rpl-clr-border, #e0e0e0);
  border-radius: var(--rpl-border-radius, 4px);
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.2s;
}

.rpl-card--link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.rpl-card--link:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rpl-card__image img {
  width: 100%;
  height: auto;
  display: block;
}

.rpl-card__content {
  padding: 1.5rem;
}

.rpl-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-card__description {
  margin: 0;
  color: var(--rpl-clr-text-light, #666);
  line-height: 1.5;
}
</style>
