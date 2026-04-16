import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { requestId } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { tasksRouter } from "./routes/tasks";
import type { AuthedRequest } from "./types";

export function createApp() {
  const app = express();

  app.use(requestId);
  app.use(helmet());
  app.use(cors());

  morgan.token("rid", (req: AuthedRequest) => req.requestId ?? "-");
  app.use(morgan(":method :url :status - :response-time ms rid=:rid"));

  app.use(express.json());

  app.use("/auth", authRouter);
  app.use(tasksRouter);

  app.use(errorHandler);

  return app;
}

