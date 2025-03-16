/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Context } from 'hono'

// Define the type for our bindings
type Bindings = {
  COUNTER: KVNamespace
}

// Create a new Hono app with the bindings
const app = new Hono<{ Bindings: Bindings }>()

// Add middleware
app.use('*', logger())
app.use('*', cors())

// Root endpoint
app.get('/', (c: Context) => {
  return c.text('Hello from Hono!')
})

// Counter endpoints
app.get('/counter/:id', async (c: Context<{ Bindings: Bindings }>) => {
  const id = c.req.param('id')
  const value = await c.env.COUNTER.get(id)
  
  if (!value) {
    return c.json({ id, count: 0 }, 200)
  }
  
  return c.json({ id, count: parseInt(value, 10) }, 200)
})

app.post('/counter/:id/increment', async (c: Context<{ Bindings: Bindings }>) => {
  const id = c.req.param('id')
  const currentValue = await c.env.COUNTER.get(id) || '0'
  const newValue = parseInt(currentValue, 10) + 1
  
  await c.env.COUNTER.put(id, newValue.toString())
  
  return c.json({ id, count: newValue }, 200)
})

app.post('/counter/:id/reset', async (c: Context<{ Bindings: Bindings }>) => {
  const id = c.req.param('id')
  await c.env.COUNTER.put(id, '0')
  
  return c.json({ id, count: 0 }, 200)
})

// Export the app
export default app 