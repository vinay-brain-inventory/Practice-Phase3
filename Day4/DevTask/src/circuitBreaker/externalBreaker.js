const CircuitBreaker = require('opossum')
const { fetchExternal } = require('../services/externalApi')

function createExternalBreaker(options) {
  const { env } = options

  const breaker = new CircuitBreaker(
    () => fetchExternal(process.env.EXTERNAL_URL || env.externalUrl, env.cbTimeoutMs),
    {
      timeout: env.cbTimeoutMs,
      errorThresholdPercentage: env.cbErrorThresholdPercent,
      resetTimeout: env.cbResetTimeoutMs
    }
  )

  breaker.fallback(() => ({ status: 503, body: { message: 'fallback' } }))

  breaker.on('open', () => console.log('circuit open'))
  breaker.on('halfOpen', () => console.log('circuit half-open'))
  breaker.on('close', () => console.log('circuit close'))

  return breaker
}

module.exports = { createExternalBreaker }

