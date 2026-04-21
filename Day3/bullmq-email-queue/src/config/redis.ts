import Redis, { type RedisOptions } from "ioredis";
import { env } from "./env";

export function redisConnectionOptions(): RedisOptions {
  return {
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  };
}

export function createRedisClient() {
  return new Redis(redisConnectionOptions());
}

