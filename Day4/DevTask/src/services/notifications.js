async function notifyUser(options) {
  const { io, missedEventsStore, userId, message } = options
  const event = { userId, message, at: Date.now() }

  const room = `user:${userId}`
  const sockets = await io.in(room).fetchSockets()
  if (!sockets.length) {
    await missedEventsStore.add(userId, event)
    return { delivered: false }
  }

  io.to(room).emit('notification', event)
  return { delivered: true }
}

module.exports = { notifyUser }

