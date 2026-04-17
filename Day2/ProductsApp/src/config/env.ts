import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3002),
  mongoUri: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/day2_products_app"
};

