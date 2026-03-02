<script setup lang="ts">
export interface RplProfileImage {
  src: string
  alt: string
}

export interface RplProfileLink {
  label: string
  url: string
}

export interface RplProfileProps {
  /** Person's full name */
  name: string
  /** Job title or role */
  role?: string
  /** Organisation name */
  organisation?: string
  /** Profile photo */
  image?: RplProfileImage
  /** Phone number */
  phone?: string
  /** Email address */
  email?: string
  /** Additional links */
  links?: RplProfileLink[]
}

const props = withDefaults(defineProps<RplProfileProps>(), {
  role: '',
  organisation: '',
  image: undefined,
  phone: '',
  email: '',
  links: () => []
})

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => (word[0] ?? '').toUpperCase())
    .join('')
}
</script>

<template>
  <div class="rpl-profile">
    <div class="rpl-profile__avatar" aria-hidden="true">
      <img
        v-if="props.image"
        :src="props.image.src"
        :alt="props.image.alt"
        class="rpl-profile__image"
      />
      <span v-else class="rpl-profile__initials">{{ getInitials(props.name) }}</span>
    </div>
    <div class="rpl-profile__details">
      <h2 class="rpl-profile__name">{{ props.name }}</h2>
      <p v-if="props.role" class="rpl-profile__role">{{ props.role }}</p>
      <p v-if="props.organisation" class="rpl-profile__organisation">{{ props.organisation }}</p>
      <ul v-if="props.phone || props.email || (props.links && props.links.length > 0)" class="rpl-profile__contact">
        <li v-if="props.phone" class="rpl-profile__contact-item">
          <a :href="`tel:${props.phone}`" class="rpl-profile__link" :aria-label="`Phone: ${props.phone}`">
            {{ props.phone }}
          </a>
        </li>
        <li v-if="props.email" class="rpl-profile__contact-item">
          <a :href="`mailto:${props.email}`" class="rpl-profile__link" :aria-label="`Email: ${props.email}`">
            {{ props.email }}
          </a>
        </li>
        <li v-for="(link, index) in props.links" :key="index" class="rpl-profile__contact-item">
          <a :href="link.url" class="rpl-profile__link" :aria-label="link.label">
            {{ link.label }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.rpl-profile {
  display: flex;
  align-items: flex-start;
  gap: var(--rpl-sp-5, 1.25rem);
  padding: var(--rpl-sp-6, 1.5rem);
  background-color: var(--rpl-clr-background-light, #f5f5f5);
  border-radius: var(--rpl-border-radius, 4px);
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-profile__avatar {
  flex-shrink: 0;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  overflow: hidden;
}

.rpl-profile__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.rpl-profile__initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: var(--rpl-clr-primary, #0052c2);
  color: var(--rpl-clr-white, #fff);
  font-size: var(--rpl-type-size-lg, 1.125rem);
  font-weight: 700;
  border-radius: 50%;
}

.rpl-profile__details {
  flex: 1;
  min-width: 0;
}

.rpl-profile__name {
  margin: 0 0 var(--rpl-sp-1, 0.25rem);
  font-size: var(--rpl-type-size-xl, 1.25rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333);
}

.rpl-profile__role {
  margin: 0 0 var(--rpl-sp-1, 0.25rem);
  font-size: var(--rpl-type-size-base, 1rem);
  color: var(--rpl-clr-text, #333);
  font-weight: 500;
}

.rpl-profile__organisation {
  margin: 0 0 var(--rpl-sp-3, 0.75rem);
  font-size: var(--rpl-type-size-sm, 0.875rem);
  color: var(--rpl-clr-text-light, #666);
}

.rpl-profile__contact {
  list-style: none;
  margin: var(--rpl-sp-3, 0.75rem) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rpl-sp-2, 0.5rem);
}

.rpl-profile__contact-item {
  margin: 0;
}

.rpl-profile__link {
  color: var(--rpl-clr-primary, #0052c2);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: var(--rpl-type-size-sm, 0.875rem);
}

.rpl-profile__link:hover {
  color: var(--rpl-clr-primary-dark, #003e91);
  text-decoration-thickness: 2px;
}

.rpl-profile__link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
