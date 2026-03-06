<script setup lang="ts">
export interface RplContactUsAddress {
  name?: string
  department?: string
  street?: string
}

export interface RplContactUsItem {
  label: string
  url: string
  icon?: string
}

export interface RplContactUsProps {
  /** Section heading — set to false to hide */
  title?: string | false
  /** Physical address details */
  address?: RplContactUsAddress
  /** Contact links (phone, email, social, etc.) */
  items?: RplContactUsItem[]
}

const props = withDefaults(defineProps<RplContactUsProps>(), {
  title: 'Contact us',
  address: undefined,
  items: () => []
})
</script>

<template>
  <section class="rpl-contact-us" :aria-label="props.title || 'Contact us'">
    <h3 v-if="props.title" class="rpl-contact-us__title">{{ props.title }}</h3>
    <div class="rpl-contact-us__body">
      <slot />
    </div>
    <address v-if="props.address" class="rpl-contact-us__address">
      <span v-if="props.address.name" class="rpl-contact-us__address-name">{{ props.address.name }}</span>
      <span v-if="props.address.department" class="rpl-contact-us__address-department">{{ props.address.department }}</span>
      <span v-if="props.address.street" class="rpl-contact-us__address-street">{{ props.address.street }}</span>
    </address>
    <ul v-if="props.items && props.items.length > 0" class="rpl-contact-us__items">
      <li v-for="(item, index) in props.items" :key="index" class="rpl-contact-us__item">
        <a :href="item.url" class="rpl-contact-us__link" :aria-label="item.label">
          <span v-if="item.icon" class="rpl-contact-us__icon" :aria-hidden="true">{{ item.icon }}</span>
          {{ item.label }}
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.rpl-contact-us {
  padding: var(--rpl-sp-6, 1.5rem);
  background-color: var(--rpl-clr-background-light, #f5f5f5);
  border-radius: var(--rpl-border-radius, 4px);
  border-left: 4px solid var(--rpl-clr-primary, #0052c2);
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-contact-us__title {
  margin: 0 0 var(--rpl-sp-4, 1rem);
  font-size: var(--rpl-type-size-xl, 1.25rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333);
}

.rpl-contact-us__body:empty {
  display: none;
}

.rpl-contact-us__body {
  margin-bottom: var(--rpl-sp-4, 1rem);
  font-size: var(--rpl-type-size-base, 1rem);
  color: var(--rpl-clr-text, #333);
}

.rpl-contact-us__address {
  display: flex;
  flex-direction: column;
  gap: var(--rpl-sp-1, 0.25rem);
  margin-bottom: var(--rpl-sp-4, 1rem);
  font-style: normal;
  font-size: var(--rpl-type-size-base, 1rem);
  color: var(--rpl-clr-text, #333);
}

.rpl-contact-us__address-name {
  font-weight: 600;
}

.rpl-contact-us__address-department {
  color: var(--rpl-clr-text-light, #666);
}

.rpl-contact-us__address-street {
  color: var(--rpl-clr-text-light, #666);
}

.rpl-contact-us__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rpl-sp-2, 0.5rem);
}

.rpl-contact-us__item {
  margin: 0;
}

.rpl-contact-us__link {
  display: inline-flex;
  align-items: center;
  gap: var(--rpl-sp-2, 0.5rem);
  color: var(--rpl-clr-primary, #0052c2);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: var(--rpl-type-size-sm, 0.875rem);
}

.rpl-contact-us__link:hover {
  color: var(--rpl-clr-primary-dark, #003e91);
  text-decoration-thickness: 2px;
}

.rpl-contact-us__link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
  border-radius: 2px;
}

.rpl-contact-us__icon {
  flex-shrink: 0;
}
</style>
