import { QueueEvents } from "bullmq";
import { redisConnectionOptions } from "../config/redis";
import { queueNames } from "./names";

export const emailQueueEvents = new QueueEvents(queueNames.email, {
  connection: redisConnectionOptions()
});

export const deadLetterQueueEvents = new QueueEvents(queueNames.deadLetter, {
  connection: redisConnectionOptions()
});

