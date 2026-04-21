import type { Job } from "bullmq";
import type { EmailJobPayload } from "../../queues/emailQueue";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmail(job: Job<EmailJobPayload>) {
  const { to, subject, html, forceFail } = job.data;

  await sleep(150);

  if (forceFail) {
    throw new Error("forced failure");
  }

  if (to.toLowerCase().includes("fail")) {
    throw new Error("simulated recipient failure");
  }

  if (job.attemptsMade < 1 && subject.toLowerCase().includes("retry")) {
    throw new Error("simulated transient failure");
  }

  return {
    to,
    subject,
    size: html.length
  };
}

