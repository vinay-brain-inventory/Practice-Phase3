import { Queue } from "bullmq";
import { redisConnectionOptions } from "../config/redis";
import { queueNames } from "./names";

export type DeadLetterPayload = {
  originalJobId: string;
  originalQueue: string;
  originalName: string;
  data: unknown;
  failedReason: string;
  attemptsMade: number;
  failedAt: number;
};

export const deadLetterQueue = new Queue<DeadLetterPayload>(queueNames.deadLetter, {
  connection: redisConnectionOptions(),
  defaultJobOptions: {
    removeOnComplete: { count: 2000 },
    removeOnFail: { count: 2000 }
  }
});

