<script setup lang="ts">
// Default layout with Ripple header, footer, and navigation
const { headerItems, footerItems, loadHeaderMenu, loadFooterMenu } = useNavigation()

await loadHeaderMenu()
await loadFooterMenu()
</script>

<template>
  <div class="rpl-layout">
    <header class="rpl-layout__header">
      <RplHeader>
        <RplNavigation
          v-if="headerItems.length > 0"
          :items="headerItems"
          variant="horizontal"
          aria-label="Primary navigation"
        />
      </RplHeader>
    </header>
    <main class="rpl-layout__main">
      <slot />
    </main>
    <footer class="rpl-layout__footer">
      <RplFooter>
        <RplNavigation
          v-if="footerItems.length > 0"
          :items="footerItems"
          variant="vertical"
          aria-label="Footer navigation"
        />
      </RplFooter>
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
