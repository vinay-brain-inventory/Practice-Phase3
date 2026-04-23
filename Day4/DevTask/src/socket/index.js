const { Server } = require('socket.io')
const { createAdapter } = require('@socket.io/redis-adapter')
const { parseBearerToken, verifyToken } = require('../utils/jwt')

function getHandshakeToken(socket) {
  if (socket.handshake && socket.handshake.auth && socket.handshake.auth.token) {
    return socket.handshake.auth.token
  }
  const header = socket.handshake && socket.handshake.headers && socket.handshake.headers.authorization
  return parseBearerToken(header)
}

async function setupSocket(httpServer, options) {
  const { jwtSecret, missedEventsStore, redisPubSub } = options

  const io = new Server(httpServer, { cors: { origin: '*' } })

  if (redisPubSub && redisPubSub.enabled) {
    io.adapter(createAdapter(redisPubSub.pub, redisPubSub.sub))
  }

  io.use((socket, next) => {
    try {
      const token = getHandshakeToken(socket)
      if (!token) return next(new Error('unauthorized'))
      const payload = verifyToken(token, jwtSecret)
      if (!payload || !payload.userId) return next(new Error('unauthorized'))
      socket.data.userId = String(payload.userId)
      return next()
    } catch {
      return next(new Error('unauthorized'))
    }
  })

  io.on('connection', async (socket) => {
    const userId = socket.data.userId
    socket.join(`user:${userId}`)

    const missed = await missedEventsStore.getAndClear(userId)
    for (const event of missed) {
      socket.emit('notification', event)
    }
  })

  return io
}

module.exports = { setupSocket }

