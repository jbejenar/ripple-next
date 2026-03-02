<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export interface RplCarouselItemLink {
  url: string
  label: string
}

export interface RplCarouselItemImage {
  src: string
  alt: string
}

export interface RplCarouselItem {
  /** Optional image for the slide */
  image?: RplCarouselItemImage
  /** Optional slide title */
  title?: string
  /** Optional slide content/description */
  content?: string
  /** Optional call-to-action link */
  link?: RplCarouselItemLink
}

export interface RplCarouselProps {
  /** Array of carousel items/slides */
  items: RplCarouselItem[]
  /** Whether to automatically advance slides */
  autoplay?: boolean
  /** Autoplay interval in milliseconds */
  interval?: number
}

const props = withDefaults(defineProps<RplCarouselProps>(), {
  autoplay: false,
  interval: 5000
})

const currentIndex = ref(0)
const isPaused = ref(false)
const carouselRef = ref<HTMLElement | null>(null)
const liveRegionRef = ref<HTMLElement | null>(null)

let autoplayTimer: ReturnType<typeof setInterval> | null = null

const totalSlides = computed(() => props.items.length)

const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

function goTo(index: number): void {
  if (index < 0 || index >= totalSlides.value) return
  currentIndex.value = index
  announceSlide()
}

function prev(): void {
  const newIndex = (currentIndex.value - 1 + totalSlides.value) % totalSlides.value
  goTo(newIndex)
}

function next(): void {
  const newIndex = (currentIndex.value + 1) % totalSlides.value
  goTo(newIndex)
}

function announceSlide(): void {
  if (liveRegionRef.value) {
    liveRegionRef.value.textContent = `Slide ${currentIndex.value + 1} of ${totalSlides.value}`
  }
}

function startAutoplay(): void {
  if (!props.autoplay || prefersReducedMotion.value) return
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    if (!isPaused.value) {
      next()
    }
  }, props.interval)
}

function stopAutoplay(): void {
  if (autoplayTimer !== null) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function onMouseenter(): void {
  isPaused.value = true
}

function onMouseleave(): void {
  isPaused.value = false
}

function onFocusin(): void {
  isPaused.value = true
}

function onFocusout(event: FocusEvent): void {
  const carousel = carouselRef.value
  const relatedTarget = event.relatedTarget as Node | null
  if (carousel && relatedTarget && carousel.contains(relatedTarget)) return
  isPaused.value = false
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prev()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    next()
  }
}

watch(
  () => props.autoplay,
  (val) => {
    if (val) {
      startAutoplay()
    } else {
      stopAutoplay()
    }
  }
)

onMounted(() => {
  if (props.autoplay) {
    startAutoplay()
  }
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <section
    ref="carouselRef"
    class="rpl-carousel"
    role="region"
    aria-roledescription="carousel"
    aria-label="Image carousel"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
    @focusin="onFocusin"
    @focusout="onFocusout"
    @keydown="onKeydown"
  >
    <!-- Live region for slide announcements -->
    <div
      ref="liveRegionRef"
      class="rpl-carousel__live-region"
      aria-live="polite"
      aria-atomic="true"
    />

    <!-- Slides container -->
    <div class="rpl-carousel__track" aria-live="off">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="rpl-carousel__slide"
        :class="{ 'rpl-carousel__slide--active': index === currentIndex }"
        role="group"
        aria-roledescription="slide"
        :aria-label="`Slide ${index + 1} of ${totalSlides}`"
        :aria-hidden="index !== currentIndex"
      >
        <figure v-if="item.image" class="rpl-carousel__figure">
          <img
            :src="item.image.src"
            :alt="item.image.alt"
            class="rpl-carousel__img"
          />
        </figure>

        <div
          v-if="item.title || item.content || item.link"
          class="rpl-carousel__body"
        >
          <h3 v-if="item.title" class="rpl-carousel__title">{{ item.title }}</h3>
          <p v-if="item.content" class="rpl-carousel__content">{{ item.content }}</p>
          <a
            v-if="item.link"
            :href="item.link.url"
            class="rpl-carousel__link"
            :tabindex="index !== currentIndex ? -1 : 0"
          >
            {{ item.link.label }}
          </a>
        </div>
      </div>
    </div>

    <!-- Navigation controls -->
    <div class="rpl-carousel__controls">
      <button
        class="rpl-carousel__nav rpl-carousel__nav--prev"
        type="button"
        aria-label="Previous slide"
        @click="prev"
      >
        &#8249;
      </button>

      <!-- Dot indicators -->
      <div class="rpl-carousel__dots" role="tablist" aria-label="Slide indicators">
        <button
          v-for="(_, index) in items"
          :key="index"
          class="rpl-carousel__dot"
          :class="{ 'rpl-carousel__dot--active': index === currentIndex }"
          type="button"
          role="tab"
          :aria-selected="index === currentIndex"
          :aria-label="`Go to slide ${index + 1}`"
          :tabindex="index === currentIndex ? 0 : -1"
          @click="goTo(index)"
        />
      </div>

      <button
        class="rpl-carousel__nav rpl-carousel__nav--next"
        type="button"
        aria-label="Next slide"
        @click="next"
      >
        &#8250;
      </button>
    </div>
  </section>
</template>

<style scoped>
.rpl-carousel {
  position: relative;
  overflow: hidden;
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-carousel__live-region {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.rpl-carousel__track {
  position: relative;
}

.rpl-carousel__slide {
  display: none;
}

.rpl-carousel__slide--active {
  display: block;
}

.rpl-carousel__figure {
  margin: 0;
}

.rpl-carousel__img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.rpl-carousel__body {
  padding: var(--rpl-sp-5, 1.25rem);
}

.rpl-carousel__title {
  margin: 0 0 var(--rpl-sp-3, 0.75rem);
  font-size: var(--rpl-type-size-xl, 1.25rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333333);
  line-height: var(--rpl-type-leading-tight, 1.25);
}

.rpl-carousel__content {
  margin: 0 0 var(--rpl-sp-4, 1rem);
  font-size: var(--rpl-type-size-base, 1rem);
  color: var(--rpl-clr-text, #333333);
  line-height: var(--rpl-type-leading-relaxed, 1.5);
}

.rpl-carousel__link {
  display: inline-block;
  color: var(--rpl-clr-primary, #0052c2);
  font-weight: 600;
  text-decoration: underline;
}

.rpl-carousel__link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-carousel__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--rpl-sp-3, 0.75rem);
  padding: var(--rpl-sp-4, 1rem);
}

.rpl-carousel__nav {
  background: none;
  border: 2px solid var(--rpl-clr-border, #e0e0e0);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--rpl-type-size-2xl, 1.5rem);
  line-height: 1;
  cursor: pointer;
  color: var(--rpl-clr-text, #333333);
  flex-shrink: 0;
  transition: background-color 0.2s, border-color 0.2s;
}

.rpl-carousel__nav:hover {
  background: var(--rpl-clr-primary, #0052c2);
  border-color: var(--rpl-clr-primary, #0052c2);
  color: var(--rpl-clr-white, #ffffff);
}

.rpl-carousel__nav:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-carousel__dots {
  display: flex;
  gap: var(--rpl-sp-2, 0.5rem);
  align-items: center;
}

.rpl-carousel__dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: var(--rpl-clr-border, #e0e0e0);
  border: 2px solid var(--rpl-clr-border, #e0e0e0);
  padding: 0;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.rpl-carousel__dot--active {
  background: var(--rpl-clr-primary, #0052c2);
  border-color: var(--rpl-clr-primary, #0052c2);
}

.rpl-carousel__dot:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .rpl-carousel__slide {
    transition: none;
  }

  .rpl-carousel__nav,
  .rpl-carousel__dot {
    transition: none;
  }
}
</style>
