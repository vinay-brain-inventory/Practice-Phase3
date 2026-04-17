import express from "express";
import { productsRouter } from "./routes/products";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/products", productsRouter);

  return app;
}

