import { Hono } from 'hono'

const app = new Hono()

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'websocket', timestamp: new Date().toISOString() })
})

// WebSocket upgrade will be handled here
// Using Hono's WebSocket support for persistent connections

const port = Number(process.env.PORT ?? 3001)
console.log(`WebSocket server starting on port ${port}`)

export default {
  port,
  fetch: app.fetch
}
