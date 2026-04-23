const Redis = require("ioredis");

function createRedisClient(url) {
  if (!url) return null;
  return new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2 });
}

module.exports = { createRedisClient };

