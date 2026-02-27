// Ripple UI — Component library for Victorian government digital products
// Re-exports all components, composables, and tokens

// Atoms
export { default as RplButton } from './components/atoms/RplButton.vue'
export { default as RplIcon } from './components/atoms/RplIcon.vue'
export { default as RplFormInput } from './components/atoms/RplFormInput.vue'

// Molecules
export { default as RplCard } from './components/molecules/RplCard.vue'
export { default as RplHeroHeader } from './components/molecules/RplHeroHeader.vue'

// Organisms
export { default as RplHeader } from './components/organisms/RplHeader.vue'
export { default as RplFooter } from './components/organisms/RplFooter.vue'

// Content (Tide-compatible section renderers)
export { default as RplContentWysiwyg } from './components/organisms/content/RplContentWysiwyg.vue'
export { default as RplAccordion } from './components/organisms/content/RplAccordion.vue'
export { default as RplCardCollection } from './components/organisms/content/RplCardCollection.vue'
export { default as RplTimeline } from './components/organisms/content/RplTimeline.vue'
export { default as RplCallToAction } from './components/organisms/content/RplCallToAction.vue'
export { default as RplKeyDates } from './components/organisms/content/RplKeyDates.vue'
export { default as RplContentImage } from './components/organisms/content/RplContentImage.vue'
export { default as RplEmbeddedVideo } from './components/organisms/content/RplEmbeddedVideo.vue'

// Composables
export { useRplTheme } from './composables/useRplTheme'

// Tokens
export * from './tokens/colors'
export * from './tokens/spacing'
export * from './tokens/typography'
