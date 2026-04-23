const Redis = require('ioredis')

function createRedisClient(redisUrl) {
  if (!redisUrl) return null

  const client = new Redis(redisUrl, { lazyConnect: true })
  client.on('error', () => {})
  return client
}

async function connectRedis(client) {
  if (!client) return false
  try {
    await client.connect()
    return true
  } catch {
    try {
      client.disconnect()
    } catch {}
    return false
  }
}

async function getRedis(redisUrl) {
  const client = createRedisClient(redisUrl)
  const enabled = await connectRedis(client)
  if (!enabled) return { enabled: false, client: null }
  return { enabled: true, client }
}

async function getRedisPubSub(redisUrl) {
  const pub = createRedisClient(redisUrl)
  const sub = createRedisClient(redisUrl)
  const enabledPub = await connectRedis(pub)
  const enabledSub = await connectRedis(sub)
  if (!enabledPub || !enabledSub) {
    try {
      pub && pub.disconnect()
    } catch {}
    try {
      sub && sub.disconnect()
    } catch {}
    return { enabled: false, pub: null, sub: null }
  }
  return { enabled: true, pub, sub }
}

module.exports = { getRedis, getRedisPubSub }

