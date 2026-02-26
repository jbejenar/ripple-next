<script setup lang="ts">
export interface RplHeaderProps {
  siteName?: string
  logoUrl?: string
}

withDefaults(defineProps<RplHeaderProps>(), {
  siteName: 'Victoria State Government',
  logoUrl: ''
})
</script>

<template>
  <header class="rpl-header">
    <div class="rpl-header__inner">
      <div class="rpl-header__logo">
        <img v-if="logoUrl" :src="logoUrl" :alt="siteName" class="rpl-header__logo-img" />
        <span v-else class="rpl-header__site-name">{{ siteName }}</span>
      </div>
      <nav class="rpl-header__nav" aria-label="Primary navigation">
        <slot />
      </nav>
    </div>
  </header>
</template>

<style scoped>
.rpl-header {
  background-color: #fff;
  border-bottom: 4px solid var(--rpl-clr-primary, #0052c2);
  padding: 1rem 1.5rem;
}

.rpl-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.rpl-header__site-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-header__logo-img {
  height: 40px;
  width: auto;
}
</style>
