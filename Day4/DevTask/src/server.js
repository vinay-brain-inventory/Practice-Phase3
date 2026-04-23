const http = require('http')
const { getEnv } = require('./config/env')
const { getRedis, getRedisPubSub } = require('./config/redis')
const { createApp } = require('./app')
const { setupSocket } = require('./socket')
const { createMemoryMissedEventsStore, createRedisMissedEventsStore } = require('./services/missedEvents')

async function start() {
  const env = getEnv()

  const redis = await getRedis(env.redisUrl)
  const pubSub = await getRedisPubSub(env.redisUrl)

  const missedEventsStore = redis.enabled
    ? createRedisMissedEventsStore(redis.client)
    : createMemoryMissedEventsStore()

  const app = createApp({
    env,
    redisClient: redis.enabled ? redis.client : null
  })
  const server = http.createServer(app)

  const io = await setupSocket(server, {
    jwtSecret: env.jwtSecret,
    missedEventsStore,
    redisPubSub: pubSub
  })

  app.locals.env = env
  app.locals.redis = redis
  app.locals.io = io
  app.locals.missedEventsStore = missedEventsStore

  server.listen(env.port, () => {
    console.log(`listening on ${env.port}`)
  })
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})

