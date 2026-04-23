const http = require('http')
const request = require('supertest')

function startStubServer(handler) {
  const server = http.createServer(handler)
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolve({ server, url: `http://127.0.0.1:${address.port}` })
    })
  })
}

describe('circuit breaker', () => {
  test('opens and returns fallback, then closes after reset', async () => {
    jest.setTimeout(15000)
    process.env.IP_RATE_LIMIT_WINDOW_MS = '1000'
    process.env.IP_RATE_LIMIT_MAX = '1000'
    process.env.USER_RATE_LIMIT_WINDOW_MS = '1000'
    process.env.USER_RATE_LIMIT_MAX = '1000'

    process.env.CB_TIMEOUT_MS = '100'
    process.env.CB_ERROR_THRESHOLD_PERCENT = '1'
    process.env.CB_RESET_TIMEOUT_MS = '300'

    process.env.EXTERNAL_URL = 'http://127.0.0.1:65530/fail'

    jest.resetModules()
    const { getEnv } = require('../src/config/env')
    const { createApp } = require('../src/app')

    const env = getEnv()
    const app = createApp({ env, redisClient: null })

    let fallbackSeen = false
    for (let i = 0; i < 10; i++) {
      const res = await request(app).get('/external')
      if (res.status === 503 && res.body && res.body.message === 'fallback') {
        fallbackSeen = true
        break
      }
    }
    expect(fallbackSeen).toBe(true)

    const stub = await startStubServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    })

    await new Promise((r) => setTimeout(r, 350))

    process.env.EXTERNAL_URL = `${stub.url}/ok`
    const res2 = await request(app).get('/external')
    expect(res2.status).toBe(200)

    await app.locals.externalBreaker.shutdown()
    await new Promise((resolve) => stub.server.close(resolve))
  })
})

