<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Sign In'
})

const { login } = useAuth()
</script>

<template>
  <div class="rpl-page-login">
    <h1>Sign In</h1>
    <p>You will be redirected to your organization's identity provider.</p>
    <RplButton data-testid="submit" @click="login"> Sign in with SSO </RplButton>
  </div>
</template>
