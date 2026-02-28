// Ripple UI — Component library for Victorian government digital products
// Re-exports all components, composables, and tokens

// Atoms
export { default as RplButton } from './components/atoms/RplButton.vue'
export { default as RplIcon } from './components/atoms/RplIcon.vue'
export { default as RplFormInput } from './components/atoms/RplFormInput.vue'
export { default as RplCheckbox } from './components/atoms/RplCheckbox.vue'
export { default as RplRadio } from './components/atoms/RplRadio.vue'
export { default as RplDropdown } from './components/atoms/RplDropdown.vue'
export { default as RplDateInput } from './components/atoms/RplDateInput.vue'
export { default as RplTextarea } from './components/atoms/RplTextarea.vue'
export { default as RplFileUpload } from './components/atoms/RplFileUpload.vue'
export { default as RplFormAlert } from './components/atoms/RplFormAlert.vue'
export { default as RplOptionButton } from './components/atoms/RplOptionButton.vue'
export { default as RplBreadcrumb } from './components/atoms/RplBreadcrumb.vue'
export { default as RplSkipLink } from './components/atoms/RplSkipLink.vue'
export { default as RplAlert } from './components/atoms/RplAlert.vue'
export { default as RplCallout } from './components/atoms/RplCallout.vue'
export { default as RplAcknowledgement } from './components/atoms/RplAcknowledgement.vue'
export { default as RplBlockQuote } from './components/atoms/RplBlockQuote.vue'
export { default as RplTag } from './components/atoms/RplTag.vue'
export { default as RplChip } from './components/atoms/RplChip.vue'

// Molecules
export { default as RplCard } from './components/molecules/RplCard.vue'
export { default as RplHeroHeader } from './components/molecules/RplHeroHeader.vue'
export { default as RplPagination } from './components/molecules/RplPagination.vue'
export { default as RplInPageNavigation } from './components/molecules/RplInPageNavigation.vue'
export { default as RplTabs } from './components/molecules/RplTabs.vue'
export { default as RplSearchBar } from './components/molecules/RplSearchBar.vue'
export { default as RplRelatedLinks } from './components/molecules/RplRelatedLinks.vue'
export { default as RplTable } from './components/molecules/RplTable.vue'
export { default as RplStatisticsGrid } from './components/molecules/RplStatisticsGrid.vue'
export { default as RplCategoryGrid } from './components/molecules/RplCategoryGrid.vue'
export { default as RplResultsListing } from './components/molecules/RplResultsListing.vue'
export { default as RplDetailList } from './components/molecules/RplDetailList.vue'
export { default as RplMediaGallery } from './components/molecules/RplMediaGallery.vue'
export { default as RplDocumentDownload } from './components/molecules/RplDocumentDownload.vue'

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
export { useRplFormValidation, rplValidationRules } from './composables/useRplFormValidation'
export type { RplValidationRule, RplFieldState } from './composables/useRplFormValidation'

// Tokens
export * from './tokens/colors'
export * from './tokens/spacing'
export * from './tokens/typography'
