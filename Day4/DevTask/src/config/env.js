function getNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getEnv() {
  return {
    port: getNumber(process.env.PORT, 3000),
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    redisUrl: process.env.REDIS_URL || '',

    ipRateLimitWindowMs: getNumber(process.env.IP_RATE_LIMIT_WINDOW_MS, 60_000),
    ipRateLimitMax: getNumber(process.env.IP_RATE_LIMIT_MAX, 100),

    userRateLimitWindowMs: getNumber(process.env.USER_RATE_LIMIT_WINDOW_MS, 60_000),
    userRateLimitMax: getNumber(process.env.USER_RATE_LIMIT_MAX, 50),

    cbTimeoutMs: getNumber(process.env.CB_TIMEOUT_MS, 2_000),
    cbErrorThresholdPercent: getNumber(process.env.CB_ERROR_THRESHOLD_PERCENT, 50),
    cbResetTimeoutMs: getNumber(process.env.CB_RESET_TIMEOUT_MS, 10_000),
    externalUrl: process.env.EXTERNAL_URL || 'https://httpbin.org/status/200'
  }
}

module.exports = { getEnv }

