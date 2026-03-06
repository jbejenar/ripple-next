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
  footerBg: '#1a1a1a',
  white: '#ffffff',
  errorBg: '#fef2f2',
  successBg: '#f0fdf4',
  warningBg: '#fffbeb',
  infoBg: '#eff6ff',
  successLight: '#e8f5e9',
  errorLight: '#fdecea',
  filetypePdf: '#dc2626',
  filetypeDoc: '#2563eb',
  filetypeXls: '#16a34a',
  filetypePpt: '#ea580c',
  filetypeImg: '#7c3aed',
  filetypeGeneric: '#6b7280'
} as const

export type RplColor = keyof typeof colors
