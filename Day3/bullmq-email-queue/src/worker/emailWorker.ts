import { Worker } from "bullmq";
import { env } from "../config/env";
import { redisConnectionOptions } from "../config/redis";
import { queueNames } from "../queues/names";
import { addToDeadLetterQueue } from "./dlq";
import { sendEmail } from "./processors/sendEmail";

export const emailWorker = new Worker(queueNames.email, sendEmail, {
  connection: redisConnectionOptions(),
  concurrency: env.workerConcurrency
});

emailWorker.on("failed", async (job, err) => {
  if (!job) return;
  if (job.attemptsMade < (job.opts.attempts ?? 0)) return;
  await addToDeadLetterQueue({ job, failedReason: err?.message ?? "failed" });
});

emailWorker.on("error", (err) => {
  console.error(err);
});

