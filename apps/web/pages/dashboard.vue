<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

useHead({
  title: 'Dashboard'
})
</script>

<template>
  <div class="rpl-page-dashboard">
    <h1 data-testid="welcome">Welcome to your Dashboard</h1>
  </div>
</template>
