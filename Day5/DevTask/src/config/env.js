const dotenv = require("dotenv");

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGO_URI || "",
  mongoUriTest: process.env.MONGO_URI_TEST || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  redisUrl: process.env.REDIS_URL || ""
};

module.exports = { env, requireEnv };

