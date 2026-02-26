<script setup lang="ts">
// Default layout with Ripple header and footer
</script>

<template>
  <div class="rpl-layout">
    <header class="rpl-layout__header">
      <RplHeader />
    </header>
    <main class="rpl-layout__main">
      <slot />
    </main>
    <footer class="rpl-layout__footer">
      <RplFooter />
    </footer>
  </div>
</template>

<style scoped>
.rpl-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.rpl-layout__main {
  flex: 1;
}
</style>
