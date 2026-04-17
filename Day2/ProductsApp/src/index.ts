import { createApp } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

async function main() {
  await connectDb(env.mongoUri);

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`listening on ${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

