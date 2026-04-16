import dotenv from "dotenv";

import { createApp } from "./app";
import { connectDb } from "./db";

dotenv.config();

async function main() {
  await connectDb();

  const app = createApp();
  const port = Number(process.env.PORT ?? 3000);

  app.listen(port, () => {
    // keep minimal
    console.log(`listening on ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

