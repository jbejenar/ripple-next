---
applyTo: "apps/web/pages/**,apps/web/components/**,apps/web/composables/**,apps/web/layouts/**"
---
# Frontend Instructions
- Use `<script setup lang="ts">` for all components
- Use Vue 3 Composition API — never Options API
- Components auto-import from `packages/ui/` and `apps/web/components/`
- Composables auto-import from `apps/web/composables/`
- Use Pinia for state management (`apps/web/stores/`)
- Use `definePageMeta` for page-level config (layout, middleware)
- Use `useHead` for SEO meta tags
- CSS follows BEM: `rpl-` prefix for Ripple, `app-` prefix for app components
- All form inputs should have accessible labels and error states
- Data fetching uses `useFetch` or `useAsyncData` with tRPC client
