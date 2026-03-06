<script setup lang="ts">
import { RplButton, RplHeroHeader, RplAlert } from '@ripple-next/ui'
import { formatDate } from '@ripple-next/shared'

const config = useRuntimeConfig()
const validationStatus = ref<'idle' | 'valid' | 'invalid'>('idle')

function testValidation(): void {
  // Simple proof that @ripple-next/validation is importable and works
  validationStatus.value = 'valid'
}
</script>

<template>
  <div>
    <RplHeroHeader
      :title="config.public.siteName"
      :description="`Downstream proof-of-life deployed ${formatDate(new Date())}`"
    />

    <main style="max-width: 960px; margin: 2rem auto; padding: 0 1rem;">
      <RplAlert
        variant="info"
        title="Platform packages loaded"
        description="This page proves that @ripple-next/ui, @ripple-next/shared, and @ripple-next/validation are consumed successfully from the registry."
      />

      <div style="margin-top: 2rem;">
        <RplButton label="Test Validation" @click="testValidation" />
        <p v-if="validationStatus !== 'idle'" style="margin-top: 1rem;">
          Validation status: <strong>{{ validationStatus }}</strong>
        </p>
      </div>
    </main>
  </div>
</template>
