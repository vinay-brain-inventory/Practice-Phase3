const { createApp } = require("./app");
const { env, requireEnv } = require("./config/env");
const { connectMongo } = require("./config/db");
const { createRedisClient } = require("./config/redis");

async function start() {
  requireEnv("JWT_SECRET");
  const mongoUri = env.mongoUri || requireEnv("MONGO_URI");
  await connectMongo(mongoUri);

  const redis = createRedisClient(env.redisUrl);
  if (redis) await redis.connect();

  const app = createApp();
  app.listen(env.port, () => {});
}

start().catch((e) => {
  process.stderr.write(`${e.stack || e.message}\n`);
  process.exit(1);
});

