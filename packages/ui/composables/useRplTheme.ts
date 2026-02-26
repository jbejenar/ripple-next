import { ref } from 'vue'

export type RplTheme = 'light' | 'dark'

const currentTheme = ref<RplTheme>('light')

export function useRplTheme() {
  function setTheme(theme: RplTheme): void {
    currentTheme.value = theme
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-rpl-theme', theme)
    }
  }

  function toggleTheme(): void {
    setTheme(currentTheme.value === 'light' ? 'dark' : 'light')
  }

  return {
    theme: currentTheme,
    setTheme,
    toggleTheme
  }
}
