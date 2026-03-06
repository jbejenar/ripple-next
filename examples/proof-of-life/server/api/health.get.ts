export default defineEventHandler((): { status: string; timestamp: string; packages: string[] } => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    packages: ['@ripple-next/ui', '@ripple-next/auth', '@ripple-next/db'],
  }
})
