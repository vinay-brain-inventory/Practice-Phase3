import express from "express";
import { createBullBoardRouter } from "./bullBoard";

export function createUiServer() {
  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/admin/queues", createBullBoardRouter());

  return app;
}

