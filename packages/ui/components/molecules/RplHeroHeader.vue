<script setup lang="ts">
export interface RplHeroHeaderProps {
  title: string
  description?: string
  backgroundImage?: string
}

defineProps<RplHeroHeaderProps>()
</script>

<template>
  <section
    class="rpl-hero-header"
    :style="backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined"
  >
    <div class="rpl-hero-header__inner">
      <h1 class="rpl-hero-header__title">{{ title }}</h1>
      <p v-if="description" class="rpl-hero-header__description">{{ description }}</p>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.rpl-hero-header {
  padding: 3rem 1.5rem;
  background-color: var(--rpl-clr-primary, #0052c2);
  background-size: cover;
  background-position: center;
  color: var(--rpl-clr-white, #ffffff);
}

.rpl-hero-header__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.rpl-hero-header__title {
  margin: 0 0 1rem;
  font-size: var(--rpl-type-size-4xl, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
}

.rpl-hero-header__description {
  margin: 0;
  font-size: var(--rpl-type-size-xl, 1.25rem);
  line-height: 1.5;
  opacity: 0.9;
}
</style>
