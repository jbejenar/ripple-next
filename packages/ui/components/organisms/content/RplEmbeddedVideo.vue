<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  url: string
  title?: string
  transcript?: string
}>()

const showTranscript = ref(false)

const embedUrl = computed(() => {
  const url = props.url
  // Convert YouTube watch URLs to embed URLs
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (youtubeMatch?.[1]) {
    return `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}`
  }
  // Convert Vimeo URLs to embed URLs
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }
  return url
})
</script>

<template>
  <div class="rpl-embedded-video">
    <div class="rpl-embedded-video__wrapper">
      <iframe
        :src="embedUrl"
        :title="props.title ?? 'Embedded video'"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="rpl-embedded-video__iframe"
      />
    </div>
    <p v-if="props.title" class="rpl-embedded-video__title">
      {{ props.title }}
    </p>
    <div v-if="props.transcript" class="rpl-embedded-video__transcript">
      <button
        class="rpl-embedded-video__transcript-toggle"
        :aria-expanded="showTranscript"
        @click="showTranscript = !showTranscript"
      >
        {{ showTranscript ? 'Hide transcript' : 'Show transcript' }}
      </button>
      <div v-show="showTranscript" class="rpl-embedded-video__transcript-content">
        {{ props.transcript }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.rpl-embedded-video {
  margin: 1.5rem 0;
}

.rpl-embedded-video__wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  border-radius: 4px;
}

.rpl-embedded-video__iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.rpl-embedded-video__title {
  margin-top: 0.5rem;
  font-weight: 600;
  color: var(--rpl-clr-type-default, #333333);
}

.rpl-embedded-video__transcript {
  margin-top: 0.5rem;
}

.rpl-embedded-video__transcript-toggle {
  background: none;
  border: none;
  color: var(--rpl-clr-primary, #0052c2);
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  padding: 0;
}

.rpl-embedded-video__transcript-toggle:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-embedded-video__transcript-content {
  margin-top: 0.5rem;
  padding: 1rem;
  background-color: var(--rpl-clr-light, #f5f5f5);
  border-radius: 4px;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--rpl-clr-type-default, #333333);
}
</style>
