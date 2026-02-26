// Ripple Design Tokens — Colors (Brand Victoria)
export const colors = {
  primary: '#0052c2',
  primaryDark: '#003e91',
  primaryLight: '#e5edf8',
  secondary: '#333333',
  success: '#027a48',
  warning: '#dc6803',
  error: '#d0021b',
  info: '#0052c2',
  text: '#333333',
  textLight: '#666666',
  textInverse: '#ffffff',
  background: '#ffffff',
  backgroundLight: '#f5f5f5',
  border: '#cccccc',
  borderLight: '#e0e0e0',
  footerBg: '#1a1a1a'
} as const

export type RplColor = keyof typeof colors
