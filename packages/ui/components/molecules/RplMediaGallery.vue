<script setup lang="ts">
import { ref, computed } from 'vue'

export interface RplMediaGalleryItem {
  id: string
  src: string
  alt: string
  title?: string
  caption?: string
  thumbnail?: string
  width?: number
  height?: number
}

export interface RplMediaGalleryProps {
  items: RplMediaGalleryItem[]
  columns?: 2 | 3 | 4
}

const props = withDefaults(defineProps<RplMediaGalleryProps>(), {
  columns: 3
})

const emit = defineEmits<{
  (e: 'select', item: RplMediaGalleryItem, index: number): void
}>()

const isOpen = ref(false)
const activeIndex = ref(0)

const activeItem = computed((): RplMediaGalleryItem | undefined =>
  props.items[activeIndex.value]
)

function openLightbox(index: number): void {
  const item = props.items[index]
  if (!item) return
  activeIndex.value = index
  isOpen.value = true
  emit('select', item, index)
}

function closeLightbox(): void {
  isOpen.value = false
}

function navigate(direction: 1 | -1): void {
  const next = activeIndex.value + direction
  if (next >= 0 && next < props.items.length) {
    activeIndex.value = next
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (!isOpen.value) return
  if (event.key === 'Escape') closeLightbox()
  if (event.key === 'ArrowLeft') navigate(-1)
  if (event.key === 'ArrowRight') navigate(1)
}
</script>

<template>
  <div class="rpl-media-gallery">
    <div
      class="rpl-media-gallery__grid"
      :class="`rpl-media-gallery__grid--cols-${columns}`"
      role="list"
    >
      <button
        v-for="(item, index) in items"
        :key="item.id"
        class="rpl-media-gallery__item"
        role="listitem"
        type="button"
        :aria-label="`View ${item.alt || item.title || 'image'}`"
        @click="openLightbox(index)"
      >
        <img
          :src="item.thumbnail || item.src"
          :alt="item.alt"
          class="rpl-media-gallery__thumbnail"
          loading="lazy"
        />
        <span v-if="item.title" class="rpl-media-gallery__item-title">
          {{ item.title }}
        </span>
      </button>
    </div>

    <!-- Lightbox overlay -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="rpl-media-gallery__lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="`Image ${activeIndex + 1} of ${items.length}`"
        @click.self="closeLightbox"
        @keydown="onKeydown"
      >
        <div class="rpl-media-gallery__lightbox-content">
          <button
            class="rpl-media-gallery__lightbox-close"
            type="button"
            aria-label="Close lightbox"
            @click="closeLightbox"
          >
            &times;
          </button>

          <button
            v-if="activeIndex > 0"
            class="rpl-media-gallery__lightbox-nav rpl-media-gallery__lightbox-nav--prev"
            type="button"
            aria-label="Previous image"
            @click="navigate(-1)"
          >
            &#8249;
          </button>

          <figure v-if="activeItem" class="rpl-media-gallery__lightbox-figure">
            <img
              :src="activeItem.src"
              :alt="activeItem.alt"
              :width="activeItem.width"
              :height="activeItem.height"
              class="rpl-media-gallery__lightbox-img"
            />
            <figcaption
              v-if="activeItem.caption || activeItem.title"
              class="rpl-media-gallery__lightbox-caption"
            >
              <strong v-if="activeItem.title">{{ activeItem.title }}</strong>
              <span v-if="activeItem.caption"> {{ activeItem.caption }}</span>
              <span class="rpl-media-gallery__lightbox-counter">
                {{ activeIndex + 1 }} / {{ items.length }}
              </span>
            </figcaption>
          </figure>

          <button
            v-if="activeIndex < items.length - 1"
            class="rpl-media-gallery__lightbox-nav rpl-media-gallery__lightbox-nav--next"
            type="button"
            aria-label="Next image"
            @click="navigate(1)"
          >
            &#8250;
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.rpl-media-gallery__grid {
  display: grid;
  gap: var(--rpl-sp-4, 1rem);
}

.rpl-media-gallery__grid--cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.rpl-media-gallery__grid--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.rpl-media-gallery__grid--cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 768px) {
  .rpl-media-gallery__grid--cols-3,
  .rpl-media-gallery__grid--cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .rpl-media-gallery__grid {
    grid-template-columns: 1fr;
  }
}

.rpl-media-gallery__item {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--rpl-clr-border, #e0e0e0);
  border-radius: var(--rpl-border-radius, 4px);
  overflow: hidden;
  background: none;
  padding: 0;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.rpl-media-gallery__item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.rpl-media-gallery__item:focus-visible {
  outline: 3px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-media-gallery__thumbnail {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.rpl-media-gallery__item-title {
  padding: var(--rpl-sp-2, 0.5rem) var(--rpl-sp-3, 0.75rem);
  font-size: var(--rpl-type-size-s, 0.875rem);
  color: var(--rpl-clr-text, #333333);
  text-align: left;
}

/* Lightbox */
.rpl-media-gallery__lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
}

.rpl-media-gallery__lightbox-content {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 90vw;
  max-height: 90vh;
}

.rpl-media-gallery__lightbox-close {
  position: absolute;
  top: -2.5rem;
  right: 0;
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
}

.rpl-media-gallery__lightbox-close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.rpl-media-gallery__lightbox-nav {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 2.5rem;
  cursor: pointer;
  padding: 1rem 0.75rem;
  line-height: 1;
  border-radius: var(--rpl-border-radius, 4px);
  flex-shrink: 0;
}

.rpl-media-gallery__lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.rpl-media-gallery__lightbox-nav:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.rpl-media-gallery__lightbox-nav--prev {
  margin-right: var(--rpl-sp-4, 1rem);
}

.rpl-media-gallery__lightbox-nav--next {
  margin-left: var(--rpl-sp-4, 1rem);
}

.rpl-media-gallery__lightbox-figure {
  margin: 0;
  text-align: center;
}

.rpl-media-gallery__lightbox-img {
  max-width: 80vw;
  max-height: 75vh;
  object-fit: contain;
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-media-gallery__lightbox-caption {
  margin-top: var(--rpl-sp-3, 0.75rem);
  color: #fff;
  font-size: var(--rpl-type-size-s, 0.875rem);
  line-height: 1.4;
}

.rpl-media-gallery__lightbox-counter {
  display: block;
  margin-top: var(--rpl-sp-2, 0.5rem);
  opacity: 0.7;
  font-size: var(--rpl-type-size-xs, 0.75rem);
}
</style>
