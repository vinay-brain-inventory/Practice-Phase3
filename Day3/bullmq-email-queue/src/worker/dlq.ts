import type { Job } from "bullmq";
import { deadLetterQueue, type DeadLetterPayload } from "../queues/deadLetterQueue";

export async function addToDeadLetterQueue(args: {
  job: Job;
  failedReason: string;
}) {
  const { job, failedReason } = args;

  const originalJobId = String(job.id ?? "");
  const payload: DeadLetterPayload = {
    originalJobId,
    originalQueue: job.queueName,
    originalName: job.name,
    data: job.data,
    failedReason,
    attemptsMade: job.attemptsMade,
    failedAt: Date.now()
  };

  const dlqJobId = originalJobId ? `dlq:${job.queueName}:${originalJobId}` : undefined;

  await deadLetterQueue.add("dead-letter", payload, {
    jobId: dlqJobId
  });
}

