<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'

export interface RplMediaFullscreenMedia {
  /** Media type: image or video */
  type: 'image' | 'video'
  /** Media source URL */
  src: string
  /** Accessible alt text for images */
  alt?: string
  /** Optional caption displayed below media */
  caption?: string
}

export interface RplMediaFullscreenProps {
  /** Media object to display fullscreen */
  media: RplMediaFullscreenMedia
  /** Whether the overlay is open */
  open?: boolean
}

const props = withDefaults(defineProps<RplMediaFullscreenProps>(), {
  open: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const dialogRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)

function close(): void {
  emit('update:open', false)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    close()
    return
  }

  if (event.key === 'Tab') {
    trapFocus(event)
  }
}

function trapFocus(event: KeyboardEvent): void {
  const dialog = dialogRef.value
  if (!dialog) return

  const focusableSelectors =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), video[controls], iframe'

  const focusableElements = Array.from(
    dialog.querySelectorAll<HTMLElement>(focusableSelectors)
  ).filter((el) => !el.hasAttribute('hidden'))

  if (focusableElements.length === 0) return

  const firstEl = focusableElements[0]
  const lastEl = focusableElements[focusableElements.length - 1]

  if (!firstEl || !lastEl) return

  if (event.shiftKey) {
    if (document.activeElement === firstEl) {
      event.preventDefault()
      lastEl.focus()
    }
  } else {
    if (document.activeElement === lastEl) {
      event.preventDefault()
      firstEl.focus()
    }
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      await nextTick()
      closeButtonRef.value?.focus()
    } else {
      document.body.style.overflow = ''
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
})

function isEmbedUrl(src: string): boolean {
  try {
    const url = new URL(src)
    const hostname = url.hostname.toLowerCase()
    const allowedHosts = ['youtube.com', 'youtu.be', 'vimeo.com']
    return allowedHosts.some(
      (host) => hostname === host || hostname.endsWith('.' + host)
    )
  } catch {
    return false
  }
}
</script>

<template>
  <div
    v-if="open"
    ref="dialogRef"
    class="rpl-media-fullscreen"
    role="dialog"
    aria-modal="true"
    :aria-label="media.alt || 'Fullscreen media viewer'"
    @keydown="onKeydown"
    @click.self="close"
  >
    <div class="rpl-media-fullscreen__content">
      <button
        ref="closeButtonRef"
        class="rpl-media-fullscreen__close"
        type="button"
        aria-label="Close fullscreen viewer"
        @click="close"
      >
        &times;
      </button>

      <figure class="rpl-media-fullscreen__figure">
        <!-- Image mode -->
        <template v-if="media.type === 'image'">
          <img
            :src="media.src"
            :alt="media.alt || ''"
            class="rpl-media-fullscreen__img"
          />
        </template>

        <!-- Video mode: embedded (iframe) or native (video) -->
        <template v-else-if="media.type === 'video'">
          <iframe
            v-if="isEmbedUrl(media.src)"
            :src="media.src"
            class="rpl-media-fullscreen__iframe"
            allowfullscreen
            title="Video player"
          />
          <video
            v-else
            :src="media.src"
            class="rpl-media-fullscreen__video"
            controls
          />
        </template>

        <figcaption
          v-if="media.caption"
          class="rpl-media-fullscreen__caption"
        >
          {{ media.caption }}
        </figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.rpl-media-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--rpl-clr-overlay, rgba(0, 0, 0, 0.9));
}

.rpl-media-fullscreen__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 95vw;
  max-height: 95vh;
}

.rpl-media-fullscreen__close {
  position: absolute;
  top: -3rem;
  right: 0;
  background: none;
  border: none;
  color: var(--rpl-clr-white, #ffffff);
  font-size: 2.5rem;
  line-height: 1;
  cursor: pointer;
  padding: var(--rpl-sp-1, 0.25rem) var(--rpl-sp-2, 0.5rem);
}

.rpl-media-fullscreen__close:focus-visible {
  outline: 2px solid var(--rpl-clr-white, #ffffff);
  outline-offset: 2px;
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-media-fullscreen__figure {
  margin: 0;
  text-align: center;
}

.rpl-media-fullscreen__img {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-media-fullscreen__video {
  max-width: 90vw;
  max-height: 80vh;
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-media-fullscreen__iframe {
  width: min(90vw, 960px);
  height: min(80vh, 540px);
  border: none;
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-media-fullscreen__caption {
  margin-top: var(--rpl-sp-3, 0.75rem);
  color: var(--rpl-clr-white, #ffffff);
  font-size: var(--rpl-type-size-s, 0.875rem);
  line-height: var(--rpl-type-leading-relaxed, 1.5);
  max-width: 60ch;
}

@media (prefers-reduced-motion: reduce) {
  .rpl-media-fullscreen {
    transition: none;
  }
}
</style>
