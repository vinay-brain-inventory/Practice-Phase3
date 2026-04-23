function createMemoryMissedEventsStore() {
  const store = new Map()

  return {
    async add(userId, event) {
      const list = store.get(userId) || []
      list.push(event)
      store.set(userId, list)
    },
    async getAndClear(userId) {
      const list = store.get(userId) || []
      store.delete(userId)
      return list
    }
  }
}

function createRedisMissedEventsStore(redis) {
  function key(userId) {
    return `missed:${userId}`
  }

  return {
    async add(userId, event) {
      await redis.rpush(key(userId), JSON.stringify(event))
    },
    async getAndClear(userId) {
      const k = key(userId)
      const values = await redis.lrange(k, 0, -1)
      if (values.length) await redis.del(k)
      return values.map((v) => {
        try {
          return JSON.parse(v)
        } catch {
          return null
        }
      }).filter(Boolean)
    }
  }
}

module.exports = { createMemoryMissedEventsStore, createRedisMissedEventsStore }

