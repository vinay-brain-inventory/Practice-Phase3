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

describe('rate limiting', () => {
  test('triggers after threshold', async () => {
    const stub = await startStubServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    })

    process.env.EXTERNAL_URL = `${stub.url}/ok`
    process.env.IP_RATE_LIMIT_WINDOW_MS = '1000'
    process.env.IP_RATE_LIMIT_MAX = '2'
    process.env.USER_RATE_LIMIT_WINDOW_MS = '1000'
    process.env.USER_RATE_LIMIT_MAX = '100'

    jest.resetModules()
    const { getEnv } = require('../src/config/env')
    const { createApp } = require('../src/app')

    const env = getEnv()
    const app = createApp({ env, redisClient: null })

    await request(app).get('/external').expect(200)
    await request(app).get('/external').expect(200)
    const third = await request(app).get('/external')
    expect(third.status).toBe(429)
    expect(third.body).toEqual({ message: 'Rate limit exceeded' })

    await app.locals.externalBreaker.shutdown()
    await new Promise((resolve) => stub.server.close(resolve))
  })
})

