<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Sign In'
})

const email = ref('')
const password = ref('')
const isLoading = ref(false)

async function handleLogin(): Promise<void> {
  isLoading.value = true
  try {
    // Auth login will be implemented via auth package
    await navigateTo('/dashboard')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="rpl-page-login">
    <h1>Sign In</h1>
    <form @submit.prevent="handleLogin">
      <RplFormInput
        v-model="email"
        data-testid="email"
        label="Email"
        type="email"
        required
      />
      <RplFormInput
        v-model="password"
        data-testid="password"
        label="Password"
        type="password"
        required
      />
      <RplButton
        data-testid="submit"
        type="submit"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Signing in...' : 'Sign In' }}
      </RplButton>
    </form>
  </div>
</template>
