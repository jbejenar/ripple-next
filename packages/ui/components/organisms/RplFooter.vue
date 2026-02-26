<script setup lang="ts">
export interface RplFooterProps {
  siteName?: string
  copyrightYear?: number
}

withDefaults(defineProps<RplFooterProps>(), {
  siteName: 'Victoria State Government',
  copyrightYear: new Date().getFullYear()
})
</script>

<template>
  <footer class="rpl-footer">
    <div class="rpl-footer__inner">
      <nav class="rpl-footer__nav" aria-label="Footer navigation">
        <slot />
      </nav>
      <div class="rpl-footer__copyright">
        <p>&copy; {{ copyrightYear }} {{ siteName }}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.rpl-footer {
  background-color: var(--rpl-clr-footer-bg, #1a1a1a);
  color: #fff;
  padding: 2rem 1.5rem;
}

.rpl-footer__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.rpl-footer__copyright {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.875rem;
  opacity: 0.8;
}
</style>
