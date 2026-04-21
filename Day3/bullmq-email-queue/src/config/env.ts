import dotenv from "dotenv";

dotenv.config();

function asInt(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: asInt(process.env.PORT, 3010),
  redis: {
    host: process.env.REDIS_HOST ?? "127.0.0.1",
    port: asInt(process.env.REDIS_PORT, 6379),
    password: (process.env.REDIS_PASSWORD ?? "").trim() || undefined
  },
  workerConcurrency: Math.max(1, asInt(process.env.WORKER_CONCURRENCY, 5))
};

