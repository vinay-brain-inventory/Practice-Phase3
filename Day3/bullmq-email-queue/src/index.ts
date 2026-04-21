import { env } from "./config/env";
import { createUiServer } from "./ui/server";
import { enqueueEmail } from "./queues/emailQueue";
import "./worker/emailWorker";

async function main() {
  const app = createUiServer();
  app.listen(env.port, () => {
    console.log(`ui listening on ${env.port}`);
  });

  await enqueueEmail({
    to: "user@example.com",
    subject: "welcome",
    html: "<b>hi</b>"
  });

  await enqueueEmail({
    to: "fail@example.com",
    subject: "retry demo",
    html: "<b>this will fail</b>"
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

