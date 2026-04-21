import { Queue, type JobsOptions } from "bullmq";
import { redisConnectionOptions } from "../config/redis";
import { queueNames } from "./names";

export type EmailJobPayload = {
  to: string;
  subject: string;
  html: string;
  forceFail?: boolean;
};

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: { count: 500 },
  removeOnFail: { count: 500 }
};

export const emailQueue = new Queue<EmailJobPayload>(queueNames.email, {
  connection: redisConnectionOptions(),
  defaultJobOptions
});

export async function enqueueEmail(payload: EmailJobPayload) {
  return await emailQueue.add("send", payload);
}

