<script setup lang="ts">
import { computed } from 'vue'

const NETWORK_TEMPLATES: Record<string, string> = {
  Facebook: 'https://www.facebook.com/sharer/sharer.php?u=$u&title=$t',
  LinkedIn: 'https://www.linkedin.com/shareArticle?url=$u',
  X: 'https://twitter.com/intent/tweet?text=$t&url=$u',
  WhatsApp: 'https://api.whatsapp.com/send?text=$u'
}

export interface RplSocialShareEmail {
  subject: string
  body: string
}

export interface RplSocialShareProps {
  /** Section heading */
  title?: string
  /** Networks to display share links for */
  networks?: string[]
  /** Page title used in share text */
  pageTitle: string
  /** URL to share */
  url: string
  /** Email share configuration */
  email?: RplSocialShareEmail
}

const props = withDefaults(defineProps<RplSocialShareProps>(), {
  title: 'Share this page',
  networks: () => ['Facebook', 'LinkedIn', 'X'],
  email: undefined
})

const emit = defineEmits<{
  share: [network: string]
}>()

const validNetworks = computed(() =>
  props.networks.filter((n) => n in NETWORK_TEMPLATES)
)

function getShareUrl(network: string): string {
  return (NETWORK_TEMPLATES[network] ?? '')
    .replace('$t', encodeURIComponent(props.pageTitle))
    .replace('$u', encodeURIComponent(props.url))
}

function getMailtoUrl(): string {
  if (!props.email) return ''
  return `mailto:?subject=${encodeURIComponent(props.email.subject)}&body=${encodeURIComponent(props.email.body)}%0A%0A${encodeURIComponent(props.url)}`
}

function getNetworkLabel(network: string): string {
  return network === 'X' ? 'X (formerly Twitter)' : network
}

function handleShare(network: string, event: Event): void {
  event.preventDefault()
  const url = getShareUrl(network)
  window.open(url, `share-${network.toLowerCase()}`, 'width=600,height=400,menubar=no,toolbar=no')
  emit('share', network)
}

function handleEmailShare(): void {
  emit('share', 'Email')
}
</script>

<template>
  <div v-if="props.pageTitle && props.url" class="rpl-social-share">
    <h3 v-if="props.title" class="rpl-social-share__title">{{ props.title }}</h3>
    <ul class="rpl-social-share__items">
      <li
        v-for="network in validNetworks"
        :key="network"
        class="rpl-social-share__item"
      >
        <a
          :href="getShareUrl(network)"
          :aria-label="`Share this page on ${getNetworkLabel(network)}`"
          class="rpl-social-share__link"
          @click.prevent="handleShare(network, $event)"
        >
          {{ getNetworkLabel(network) }}
        </a>
      </li>
      <li v-if="props.email" class="rpl-social-share__item">
        <a
          :href="getMailtoUrl()"
          aria-label="Share this page via email"
          class="rpl-social-share__link"
          @click="handleEmailShare"
        >
          Email
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.rpl-social-share {
  padding: var(--rpl-sp-5, 1.25rem) 0;
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-social-share__title {
  margin: 0 0 var(--rpl-sp-3, 0.75rem);
  font-size: var(--rpl-type-size-base, 1rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333);
}

.rpl-social-share__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--rpl-sp-3, 0.75rem);
}

.rpl-social-share__item {
  margin: 0;
}

.rpl-social-share__link {
  display: inline-block;
  padding: var(--rpl-sp-2, 0.5rem) var(--rpl-sp-4, 1rem);
  font-size: var(--rpl-type-size-sm, 0.875rem);
  font-weight: 500;
  color: var(--rpl-clr-primary, #0052c2);
  text-decoration: underline;
  text-underline-offset: 2px;
  border-radius: var(--rpl-border-radius, 4px);
  background-color: var(--rpl-clr-background-light, #f5f5f5);
}

.rpl-social-share__link:hover {
  color: var(--rpl-clr-primary-dark, #003e91);
  text-decoration-thickness: 2px;
  background-color: var(--rpl-clr-background-alt, #e8e8e8);
}

.rpl-social-share__link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
