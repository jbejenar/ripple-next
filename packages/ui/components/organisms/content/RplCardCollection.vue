<script setup lang="ts">
const props = defineProps<{
  title?: string
  cards: Array<{
    title: string
    summary: string
    link?: { text: string; url: string; external?: boolean }
    image?: { src: string; alt: string }
  }>
}>()
</script>

<template>
  <div class="rpl-card-collection">
    <h2 v-if="props.title" class="rpl-card-collection__title">
      {{ props.title }}
    </h2>
    <div class="rpl-card-collection__grid">
      <RplCard
        v-for="(card, index) in props.cards"
        :key="index"
        :title="card.title"
        :description="card.summary"
        :link="card.link?.url"
        :image="card.image?.src"
      />
    </div>
  </div>
</template>

<style scoped>
.rpl-card-collection {
  margin: 1.5rem 0;
}

.rpl-card-collection__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--rpl-clr-type-default, #333333);
}

.rpl-card-collection__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
</style>
