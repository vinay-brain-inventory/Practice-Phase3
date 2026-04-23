const express = require("express");
const { authRoutes } = require("./routes/authRoutes");
const { protectedRoutes } = require("./routes/protectedRoutes");
const { errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();
  app.use(express.json());
  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
  app.use("/api/auth", authRoutes);
  app.use("/api/protected", protectedRoutes);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };

