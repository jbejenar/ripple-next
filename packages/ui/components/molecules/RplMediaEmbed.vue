<script setup lang="ts">
import { ref, computed } from 'vue'

export interface RplMediaEmbedProps {
  /** Type of media being embedded */
  type: 'video' | 'image'
  /** Media title */
  title: string
  /** Source URL (video embed URL or image src) */
  src: string
  /** Image alt text (for type="image") */
  alt?: string
  /** Whether to show the title visually */
  showTitle?: boolean
  /** Image variant (for type="image") */
  variant?: 'landscape' | 'portrait' | 'square'
  /** Caption text */
  caption?: string
  /** Source/attribution caption */
  sourceCaption?: string
  /** URL to a transcript (for video) */
  transcriptUrl?: string
  /** Whether fullscreen viewing is allowed (for images) */
  allowFullscreen?: boolean
}

const props = withDefaults(defineProps<RplMediaEmbedProps>(), {
  alt: '',
  showTitle: false,
  variant: undefined,
  caption: undefined,
  sourceCaption: undefined,
  transcriptUrl: undefined,
  allowFullscreen: false
})

const emit = defineEmits<{
  'view-transcript': []
  'view-fullscreen': [open: boolean]
}>()

const isFullscreenOpen = ref(false)

// For video: convert YouTube/Vimeo watch URLs to embed URLs
const embedUrl = computed(() => {
  if (props.type !== 'video') return props.src
  const url = props.src
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  )
  if (youtubeMatch?.[1])
    return `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch?.[1])
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
})

function toggleFullscreen(): void {
  isFullscreenOpen.value = !isFullscreenOpen.value
  emit('view-fullscreen', isFullscreenOpen.value)
}

function handleTranscriptClick(): void {
  emit('view-transcript')
}
</script>

<template>
  <div class="rpl-media-embed">
    <h3 v-if="showTitle" class="rpl-media-embed__title">
      {{ title }}
    </h3>

    <figure class="rpl-media-embed__figure">
      <!-- Video embed -->
      <div v-if="type === 'video'" class="rpl-media-embed__video-wrapper">
        <iframe
          :src="embedUrl"
          :title="title"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="rpl-media-embed__iframe"
        />
      </div>

      <!-- Image embed -->
      <img
        v-if="type === 'image'"
        :src="src"
        :alt="alt"
        :class="[
          'rpl-media-embed__image',
          variant ? `rpl-media-embed__image--${variant}` : ''
        ]"
        loading="lazy"
      />

      <!-- Figcaption -->
      <figcaption
        v-if="caption || sourceCaption"
        class="rpl-media-embed__figcaption"
      >
        <span v-if="caption" class="rpl-media-embed__caption">{{
          caption
        }}</span>
        <span v-if="sourceCaption" class="rpl-media-embed__source-caption">{{
          sourceCaption
        }}</span>
      </figcaption>
    </figure>

    <!-- Actions -->
    <ul
      v-if="transcriptUrl || allowFullscreen"
      class="rpl-media-embed__actions"
    >
      <li v-if="transcriptUrl">
        <a
          :href="transcriptUrl"
          class="rpl-media-embed__action-link"
          @click.prevent="handleTranscriptClick"
        >
          View transcript
        </a>
      </li>
      <li v-if="allowFullscreen">
        <button
          class="rpl-media-embed__action-link"
          type="button"
          @click="toggleFullscreen"
        >
          {{ isFullscreenOpen ? 'Exit fullscreen' : 'View fullscreen' }}
        </button>
      </li>
    </ul>

    <!-- Fullscreen overlay -->
    <dialog
      v-if="allowFullscreen && type === 'image'"
      :open="isFullscreenOpen"
      class="rpl-media-embed__fullscreen"
    >
      <div class="rpl-media-embed__fullscreen-inner">
        <button
          class="rpl-media-embed__fullscreen-close"
          type="button"
          aria-label="Close fullscreen"
          @click="toggleFullscreen"
        >
          Close
        </button>
        <img :src="src" :alt="alt" class="rpl-media-embed__fullscreen-image" />
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.rpl-media-embed {
  margin: 1.5rem 0;
}

.rpl-media-embed__title {
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--rpl-clr-type-default, #333333);
}

.rpl-media-embed__figure {
  margin: 0;
}

/* Video 16:9 wrapper */
.rpl-media-embed__video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-media-embed__iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* Image */
.rpl-media-embed__image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--rpl-border-radius, 4px);
  object-fit: cover;
}

.rpl-media-embed__image--landscape {
  aspect-ratio: 16 / 9;
}

.rpl-media-embed__image--portrait {
  aspect-ratio: 3 / 4;
}

.rpl-media-embed__image--square {
  aspect-ratio: 1 / 1;
}

/* Figcaption */
.rpl-media-embed__figcaption {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--rpl-clr-type-light, #666666);
}

.rpl-media-embed__source-caption {
  font-style: italic;
}

/* Actions */
.rpl-media-embed__actions {
  display: flex;
  gap: 1rem;
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
}

.rpl-media-embed__action-link {
  background: none;
  border: none;
  color: var(--rpl-clr-primary, #0052c2);
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  padding: 0;
}

.rpl-media-embed__action-link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

/* Fullscreen overlay */
.rpl-media-embed__fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
  border: none;
  padding: 1rem;
  width: 100%;
  height: 100%;
}

.rpl-media-embed__fullscreen:not([open]) {
  display: none;
}

.rpl-media-embed__fullscreen-inner {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.rpl-media-embed__fullscreen-close {
  position: absolute;
  top: -2.5rem;
  right: 0;
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 1rem;
}

.rpl-media-embed__fullscreen-image {
  display: block;
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}
</style>
