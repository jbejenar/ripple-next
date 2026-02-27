<script setup lang="ts">
const props = defineProps<{
  cta: {
    title: string
    summary: string
    link: { text: string; url: string; external?: boolean }
    image?: { src: string; alt: string }
  }
}>()
</script>

<template>
  <div class="rpl-call-to-action" :class="{ 'rpl-call-to-action--with-image': props.cta.image }">
    <div v-if="props.cta.image" class="rpl-call-to-action__image">
      <img :src="props.cta.image.src" :alt="props.cta.image.alt" />
    </div>
    <div class="rpl-call-to-action__content">
      <h3 class="rpl-call-to-action__title">{{ props.cta.title }}</h3>
      <p class="rpl-call-to-action__summary">{{ props.cta.summary }}</p>
      <RplButton
        :href="props.cta.link.url"
        variant="primary"
      >
        {{ props.cta.link.text }}
      </RplButton>
    </div>
  </div>
</template>

<style scoped>
.rpl-call-to-action {
  margin: 1.5rem 0;
  padding: 2rem;
  background-color: var(--rpl-clr-light, #f5f5f5);
  border-radius: 4px;
}

.rpl-call-to-action--with-image {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.rpl-call-to-action__image {
  flex-shrink: 0;
  width: 200px;
}

.rpl-call-to-action__image img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.rpl-call-to-action__content {
  flex: 1;
}

.rpl-call-to-action__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--rpl-clr-type-default, #333333);
}

.rpl-call-to-action__summary {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--rpl-clr-type-default, #333333);
}

@media (max-width: 768px) {
  .rpl-call-to-action--with-image {
    flex-direction: column;
  }

  .rpl-call-to-action__image {
    width: 100%;
  }
}
</style>
