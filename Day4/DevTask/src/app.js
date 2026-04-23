const express = require('express')
const { createGlobalRateLimiters } = require('./rateLimiter')
const { createExternalBreaker } = require('./circuitBreaker/externalBreaker')
const { notifyUser } = require('./services/notifications')

function createApp(options) {
  const env = options.env
  const redisClient = options.redisClient || null

  const app = express()
  app.use(express.json())

  const { ipLimiter, userLimiter } = createGlobalRateLimiters({ env, redisClient })

  app.use(ipLimiter)
  app.use(userLimiter)

  const externalBreaker = createExternalBreaker({ env })
  app.locals.externalBreaker = externalBreaker

  app.post('/notify', async (req, res) => {
    const { userId, message } = req.body || {}
    if (!userId || !message) return res.status(400).json({ message: 'Invalid body' })
    const io = req.app.locals.io
    const missedEventsStore = req.app.locals.missedEventsStore
    if (!io || !missedEventsStore) return res.status(500).json({ message: 'Not ready' })

    const result = await notifyUser({
      io,
      missedEventsStore,
      userId: String(userId),
      message: String(message)
    })

    return res.json(result)
  })

  app.get('/external', async (req, res) => {
    const result = await req.app.locals.externalBreaker.fire()
    return res.status(result.status).json(result.body)
  })

  return app
}

module.exports = { createApp }

