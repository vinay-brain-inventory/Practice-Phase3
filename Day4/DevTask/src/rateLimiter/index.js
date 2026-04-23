const rateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')
const { parseBearerToken, verifyToken } = require('../utils/jwt')

function buildStore(redisClient) {
  if (!redisClient) return undefined
  return new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  })
}

function attachUserFromJwt(req, jwtSecret) {
  const token = parseBearerToken(req.headers.authorization)
  if (!token) return null
  try {
    const payload = verifyToken(token, jwtSecret)
    if (!payload || !payload.userId) return null
    return { userId: String(payload.userId) }
  } catch {
    return null
  }
}

function createGlobalRateLimiters(options) {
  const { env, redisClient } = options
  const store = buildStore(redisClient)

  const ipLimiter = rateLimit({
    windowMs: env.ipRateLimitWindowMs,
    max: env.ipRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    keyGenerator: (req) => `ip:${req.ip}`,
    message: { message: 'Rate limit exceeded' }
  })

  const userLimiter = rateLimit({
    windowMs: env.userRateLimitWindowMs,
    max: env.userRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    keyGenerator: (req) => {
      const user = attachUserFromJwt(req, env.jwtSecret)
      return user ? `user:${user.userId}` : `ip:${req.ip}`
    },
    message: { message: 'Rate limit exceeded' }
  })

  return { ipLimiter, userLimiter }
}

module.exports = { createGlobalRateLimiters, attachUserFromJwt }

