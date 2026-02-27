<script setup lang="ts">
const props = defineProps<{
  image: {
    src: string
    alt: string
    title?: string
    width?: number
    height?: number
  }
  caption?: string
}>()
</script>

<template>
  <figure class="rpl-content-image">
    <img
      :src="props.image.src"
      :alt="props.image.alt"
      :title="props.image.title"
      :width="props.image.width"
      :height="props.image.height"
      class="rpl-content-image__img"
      loading="lazy"
    />
    <figcaption v-if="props.caption" class="rpl-content-image__caption">
      {{ props.caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.rpl-content-image {
  margin: 1.5rem 0;
}

.rpl-content-image__img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.rpl-content-image__caption {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--rpl-clr-type-light, #666666);
  line-height: 1.4;
}
</style>
